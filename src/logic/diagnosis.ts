import { FAULTS, type Check, type Next, type Terminal } from '../data/demo';
import { inRange } from './measure';

export type ObservationValue = 'ja' | 'nee' | 'weet-niet';

export type Answer =
  | { checkId: string; kind: 'observation'; value: ObservationValue }
  | { checkId: string; kind: 'measurement'; value: number };

export type DiagnosisState =
  | { status: 'check'; check: Check; index: number }
  | { status: 'end'; terminal: Terminal; lastCheck: Check }
  | { status: 'unavailable' };

export function nextFor(check: Check, answer: Answer): Next {
  if (check.kind === 'observation' && answer.kind === 'observation') {
    if (answer.value === 'ja') return check.onYes;
    if (answer.value === 'nee') return check.onNo;
    return check.onUnknown;
  }
  if (check.kind === 'measurement' && answer.kind === 'measurement') {
    return inRange(answer.value, check.min, check.max) ? check.inRange : check.outOfRange;
  }
  throw new Error(`Antwoord past niet bij controle ${check.id}`);
}

/**
 * Loopt de beslisboom af met de gegeven antwoorden. Antwoorden die niet (meer)
 * op het afgelegde pad liggen worden genegeerd; pruneAnswers verwijdert ze.
 */
export function evaluate(faultCode: string | undefined, answers: Answer[]): DiagnosisState {
  const fault = faultCode ? FAULTS[faultCode] : undefined;
  if (!fault) return { status: 'unavailable' };
  let check = fault.checks[fault.rootCheck];
  for (let i = 0; ; i++) {
    const answer = answers[i];
    if (!answer || answer.checkId !== check.id) return { status: 'check', check, index: i };
    const next = nextFor(check, answer);
    if ('end' in next) return { status: 'end', terminal: next.end, lastCheck: check };
    check = fault.checks[next.check];
  }
}

/** Houdt alleen de antwoorden die op het huidige pad liggen. */
export function pruneAnswers(faultCode: string | undefined, answers: Answer[]): Answer[] {
  const fault = faultCode ? FAULTS[faultCode] : undefined;
  if (!fault) return [];
  const kept: Answer[] = [];
  let check: Check | undefined = fault.checks[fault.rootCheck];
  for (const answer of answers) {
    if (!check || answer.checkId !== check.id) break;
    kept.push(answer);
    const next = nextFor(check, answer);
    check = 'end' in next ? undefined : fault.checks[next.check];
  }
  return kept;
}
