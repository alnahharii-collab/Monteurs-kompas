'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { DiagnosisSession } from '@/domain/diagnosis/types';

/**
 * Lokale opslag van diagnosesessies (localStorage). De sessievorm is serialiseerbaar
 * en kan later ongewijzigd naar een server.
 */
const KEY = 'mk.sessions.v1';
const EVENT = 'mk:sessions';

type SessionMap = Record<string, DiagnosisSession>;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

let cacheRaw: string | null | undefined;
let cacheMap: SessionMap = {};

function parse(raw: string | null): SessionMap {
  if (raw === cacheRaw) return cacheMap;
  cacheRaw = raw;
  try {
    const data: unknown = raw ? JSON.parse(raw) : {};
    const map: SessionMap = {};
    if (data && typeof data === 'object') {
      for (const [id, value] of Object.entries(data as Record<string, unknown>)) {
        if (isSession(value)) map[id] = value;
      }
    }
    cacheMap = map;
  } catch {
    cacheMap = {};
  }
  return cacheMap;
}

function isSession(value: unknown): value is DiagnosisSession {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<DiagnosisSession>;
  return v.schemaVersion === 1 && typeof v.id === 'string' && typeof v.caseId === 'string' && Array.isArray(v.path);
}

export function readSessions(): SessionMap {
  return parse(readRaw());
}

export function saveSession(session: DiagnosisSession): boolean {
  const map = { ...readSessions(), [session.id]: session };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(EVENT));
  return true;
}

export function newSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function subscribe(listener: () => void): () => void {
  window.addEventListener('storage', listener);
  window.addEventListener(EVENT, listener);
  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener(EVENT, listener);
  };
}

/** undefined = nog niet geladen (server/hydratie). */
export function useSessions(): SessionMap | undefined {
  return useSyncExternalStore(subscribe, readSessions, () => undefined);
}

export type SessionState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'ready'; session: DiagnosisSession };

export function useSession(id: string): [SessionState, (session: DiagnosisSession) => void] {
  const sessions = useSessions();
  const update = useCallback((session: DiagnosisSession) => {
    saveSession(session);
  }, []);
  if (sessions === undefined) return [{ status: 'loading' }, update];
  const session = sessions[id];
  return [session ? { status: 'ready', session } : { status: 'missing' }, update];
}

/** Laatst bijgewerkte, nog lopende sessie (optioneel per toestel). */
export function latestOpenSession(sessions: SessionMap, applianceId?: string): DiagnosisSession | null {
  return (
    Object.values(sessions)
      .filter((s) => (s.status === 'active' || s.status === 'safety-stop') && (!applianceId || s.applianceId === applianceId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null
  );
}
