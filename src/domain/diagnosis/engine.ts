import { isTodo } from '../content';
import { evaluateMeasurement } from './measurement';
import type { DiagnosisCase, DiagnosisSession, DiagnosisStep, PathEntry } from './types';

export class DiagnosisError extends Error {
  constructor(
    public readonly code:
      | 'not-active'
      | 'wrong-step-type'
      | 'invalid-option'
      | 'safety-pending'
      | 'no-safety-pending',
    message: string,
  ) {
    super(message);
    this.name = 'DiagnosisError';
  }
}

/** Geeft de stap terug, of null als de stap ontbreekt of als TODO is gemarkeerd. */
export function resolveStep(diagnosisCase: DiagnosisCase, stepId: string): DiagnosisStep | null {
  if (isTodo(stepId)) return null;
  return diagnosisCase.steps[stepId] ?? null;
}

export function currentStep(diagnosisCase: DiagnosisCase, session: DiagnosisSession): DiagnosisStep | null {
  return resolveStep(diagnosisCase, session.currentStepId);
}

/** Stapnummer zoals de monteur het ziet: aantal genomen beslissingen + 1. */
export function stepNumber(session: DiagnosisSession): number {
  return session.path.filter((entry) => entry.kind !== 'safety-acknowledged').length + 1;
}

export function createSession(params: {
  id: string;
  diagnosisCase: DiagnosisCase;
  now: string;
}): DiagnosisSession {
  const base: DiagnosisSession = {
    schemaVersion: 1,
    id: params.id,
    applianceId: params.diagnosisCase.applianceId,
    caseId: params.diagnosisCase.id,
    startedAt: params.now,
    updatedAt: params.now,
    status: 'active',
    currentStepId: params.diagnosisCase.startStepId,
    path: [],
    pendingSafety: null,
    outcome: null,
    actions: [],
    notes: '',
  };
  return enterStep(params.diagnosisCase, base, params.diagnosisCase.startStepId, params.now);
}

export function answerQuestion(
  diagnosisCase: DiagnosisCase,
  session: DiagnosisSession,
  optionIndex: number,
  now: string,
): DiagnosisSession {
  const step = requireActiveStep(diagnosisCase, session, 'question');
  const option = step.options[optionIndex];
  if (!option) throw new DiagnosisError('invalid-option', `Optie ${optionIndex} bestaat niet in stap ${step.id}.`);

  const entry: PathEntry = { kind: 'answer', stepId: step.id, at: now, optionIndex, label: option.label };
  const next: DiagnosisSession = { ...session, path: [...session.path, entry], updatedAt: now };

  if (option.safety) {
    return {
      ...next,
      status: 'safety-stop',
      pendingSafety: { stepId: step.id, flag: option.safety, next: option.next },
    };
  }
  return enterStep(diagnosisCase, next, option.next, now);
}

/** value = null betekent: niet gemeten / kon niet meten. */
export function submitMeasurement(
  diagnosisCase: DiagnosisCase,
  session: DiagnosisSession,
  value: number | null,
  now: string,
): DiagnosisSession {
  const step = requireActiveStep(diagnosisCase, session, 'measurement');
  const evaluation = evaluateMeasurement(step, value);
  const entry: PathEntry = { kind: 'measurement', stepId: step.id, at: now, value, unit: step.unit, evaluation };
  const target =
    evaluation === 'in-range' ? step.next.inRange : evaluation === 'out-of-range' ? step.next.outOfRange : step.next.unknown;
  return enterStep(diagnosisCase, { ...session, path: [...session.path, entry], updatedAt: now }, target, now);
}

export function completeInstruction(
  diagnosisCase: DiagnosisCase,
  session: DiagnosisSession,
  now: string,
): DiagnosisSession {
  const step = requireActiveStep(diagnosisCase, session, 'instruction');
  const entry: PathEntry = { kind: 'instruction-done', stepId: step.id, at: now };
  return enterStep(diagnosisCase, { ...session, path: [...session.path, entry], updatedAt: now }, step.next, now);
}

/** Expliciete bevestiging van het STOP-scherm. Alleen zo gaat de flow verder. */
export function acknowledgeSafety(
  diagnosisCase: DiagnosisCase,
  session: DiagnosisSession,
  now: string,
): DiagnosisSession {
  const pending = session.pendingSafety;
  if (session.status !== 'safety-stop' || !pending) {
    throw new DiagnosisError('no-safety-pending', 'Er staat geen veiligheidsstop open.');
  }
  const entry: PathEntry = { kind: 'safety-acknowledged', stepId: pending.stepId, at: now, flag: pending.flag };
  const acknowledged: DiagnosisSession = {
    ...session,
    path: [...session.path, entry],
    pendingSafety: null,
    status: 'active',
    updatedAt: now,
  };

  if (pending.next === null) {
    return {
      ...acknowledged,
      status: 'completed',
      outcome: {
        stepId: pending.stepId,
        kind: 'safety',
        cause: pending.flag.reason,
        action: pending.flag.action,
        sourceIds: pending.flag.sourceIds,
      },
    };
  }
  return enterStep(diagnosisCase, acknowledged, pending.next, now);
}

/**
 * Eén beslissing terug. Geeft null als er niets meer terug te nemen is.
 * Tijdens een open veiligheidsstop kan niet worden teruggegaan.
 */
export function goBack(
  diagnosisCase: DiagnosisCase,
  session: DiagnosisSession,
  now: string,
): DiagnosisSession | null {
  if (session.status === 'safety-stop') {
    throw new DiagnosisError('safety-pending', 'Bevestig eerst de veiligheidsstop.');
  }
  const path = [...session.path];
  while (path.length > 0 && path[path.length - 1]?.kind === 'safety-acknowledged') path.pop();
  const last = path.pop();
  if (!last) return null;
  return {
    ...session,
    path,
    status: 'active',
    pendingSafety: null,
    outcome: null,
    currentStepId: last.stepId,
    updatedAt: now,
  };
}

export function abortSession(session: DiagnosisSession, now: string): DiagnosisSession {
  if (session.status === 'safety-stop') {
    throw new DiagnosisError('safety-pending', 'Bevestig eerst de veiligheidsstop.');
  }
  if (session.status === 'completed') return session;
  return { ...session, status: 'aborted', updatedAt: now };
}

export function setNotes(session: DiagnosisSession, notes: string, now: string): DiagnosisSession {
  return { ...session, notes, updatedAt: now };
}

export function setActions(session: DiagnosisSession, actions: string[], now: string): DiagnosisSession {
  return { ...session, actions, updatedAt: now };
}

export function isFinished(session: DiagnosisSession): boolean {
  return session.status === 'completed' || session.status === 'aborted';
}

function enterStep(
  diagnosisCase: DiagnosisCase,
  session: DiagnosisSession,
  stepId: string,
  now: string,
): DiagnosisSession {
  const step = resolveStep(diagnosisCase, stepId);
  const moved: DiagnosisSession = { ...session, currentStepId: stepId, updatedAt: now };
  if (!step) return moved;

  if (step.type === 'outcome') {
    return {
      ...moved,
      status: 'completed',
      outcome: {
        stepId: step.id,
        kind: 'diagnosis',
        cause: step.cause,
        action: step.action,
        verification: step.verification,
        sourceIds: step.sourceIds,
      },
    };
  }
  if (step.type === 'safety-stop') {
    return {
      ...moved,
      status: 'safety-stop',
      pendingSafety: {
        stepId: step.id,
        flag: {
          category: step.category ?? 'unsafe-appliance',
          reason: step.reason,
          action: step.action,
          sourceIds: step.sourceIds,
        },
        next: null,
      },
    };
  }
  return moved;
}

function requireActiveStep<T extends DiagnosisStep['type']>(
  diagnosisCase: DiagnosisCase,
  session: DiagnosisSession,
  type: T,
): Extract<DiagnosisStep, { type: T }> {
  if (session.status === 'safety-stop') {
    throw new DiagnosisError('safety-pending', 'Bevestig eerst de veiligheidsstop.');
  }
  if (session.status !== 'active') throw new DiagnosisError('not-active', 'De diagnose is niet actief.');
  const step = currentStep(diagnosisCase, session);
  if (!step || step.type !== type) {
    throw new DiagnosisError('wrong-step-type', `Huidige stap is geen ${type}.`);
  }
  return step as Extract<DiagnosisStep, { type: T }>;
}
