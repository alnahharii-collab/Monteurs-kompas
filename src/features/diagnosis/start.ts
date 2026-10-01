'use client';

import { createSession } from '@/domain/diagnosis/engine';
import type { DiagnosisCase } from '@/domain/diagnosis/types';
import { newSessionId, saveSession } from './session-store';

/** Start een sessie en geeft de route terug, of null als opslaan niet lukt. */
export function startDiagnosis(diagnosisCase: DiagnosisCase): string | null {
  const session = createSession({ id: newSessionId(), diagnosisCase, now: new Date().toISOString() });
  return saveSession(session) ? `/diagnose/${session.id}` : null;
}
