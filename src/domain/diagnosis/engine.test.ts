import { describe, expect, it } from 'vitest';
import fixture from '../../../tests/fixtures/testcasus.case.json';
import {
  abortSession,
  acknowledgeSafety,
  answerQuestion,
  completeInstruction,
  createSession,
  currentStep,
  DiagnosisError,
  goBack,
  stepNumber,
  submitMeasurement,
} from './engine';
import type { DiagnosisCaseFile } from './types';

const c = (fixture as DiagnosisCaseFile).case;
const t = (n: number) => `2026-01-01T00:00:0${n}.000Z`;
const start = () => createSession({ id: 's1', diagnosisCase: c, now: t(0) });

describe('createSession', () => {
  it('start op de startstap, actief, zonder pad', () => {
    const s = start();
    expect(s.currentStepId).toBe('vraag-1');
    expect(s.status).toBe('active');
    expect(s.path).toEqual([]);
    expect(stepNumber(s)).toBe(1);
    expect(s.applianceId).toBe(c.applianceId);
  });
});

describe('answerQuestion', () => {
  it('legt het antwoord vast en gaat naar de volgende stap', () => {
    const s = answerQuestion(c, start(), 0, t(1));
    expect(s.currentStepId).toBe('meting-1');
    expect(s.path).toEqual([{ kind: 'answer', stepId: 'vraag-1', at: t(1), optionIndex: 0, label: 'Ja' }]);
    expect(stepNumber(s)).toBe(2);
  });

  it('weigert een onbekende optie', () => {
    expect(() => answerQuestion(c, start(), 9, t(1))).toThrow(DiagnosisError);
  });

  it('weigert een antwoord op een stap van een ander type', () => {
    const s = answerQuestion(c, start(), 0, t(1));
    expect(() => answerQuestion(c, s, 0, t(2))).toThrow(/geen question/);
  });
});

describe('veiligheid', () => {
  it('een antwoord met safety-vlag stopt de flow direct', () => {
    const s = answerQuestion(c, start(), 2, t(1));
    expect(s.status).toBe('safety-stop');
    expect(s.pendingSafety?.flag.category).toBe('gas-leak');
    expect(s.currentStepId).toBe('vraag-1');
  });

  it('zonder bevestiging kan niets: geen antwoord, geen terug, geen afbreken', () => {
    const s = answerQuestion(c, start(), 2, t(1));
    expect(() => answerQuestion(c, s, 0, t(2))).toThrow(DiagnosisError);
    expect(() => goBack(c, s, t(2))).toThrow(DiagnosisError);
    expect(() => abortSession(s, t(2))).toThrow(DiagnosisError);
  });

  it('na expliciete bevestiging gaat de flow verder en staat de bevestiging in het pad', () => {
    const s = acknowledgeSafety(c, answerQuestion(c, start(), 2, t(1)), t(2));
    expect(s.status).toBe('active');
    expect(s.currentStepId).toBe('instructie-1');
    expect(s.path.at(-1)?.kind).toBe('safety-acknowledged');
    expect(stepNumber(s)).toBe(2);
  });

  it('een safety-stop-stap eindigt na bevestiging in een veiligheidsuitkomst', () => {
    let s = answerQuestion(c, start(), 0, t(1));
    s = submitMeasurement(c, s, 5, t(2));
    expect(s.status).toBe('safety-stop');
    expect(s.pendingSafety?.next).toBeNull();
    s = acknowledgeSafety(c, s, t(3));
    expect(s.status).toBe('completed');
    expect(s.outcome).toMatchObject({ kind: 'safety', stepId: 'stop-1' });
  });

  it('bevestigen zonder open stop is een fout', () => {
    expect(() => acknowledgeSafety(c, start(), t(1))).toThrow(/geen veiligheidsstop/);
  });
});

describe('submitMeasurement', () => {
  const atMeting = () => answerQuestion(c, start(), 0, t(1));

  it('binnen bereik → inRange', () => {
    const s = submitMeasurement(c, atMeting(), 1.5, t(2));
    expect(s.path.at(-1)).toMatchObject({ kind: 'measurement', value: 1.5, unit: 'bar', evaluation: 'in-range' });
    expect(s.status).toBe('completed');
    expect(s.outcome).toMatchObject({ kind: 'diagnosis', cause: 'Testoorzaak' });
  });

  it('bereikgrenzen zijn inclusief', () => {
    expect(submitMeasurement(c, atMeting(), 1, t(2)).currentStepId).toBe('uitkomst-1');
    expect(submitMeasurement(c, atMeting(), 2, t(2)).currentStepId).toBe('uitkomst-1');
  });

  it('niet gemeten → unknown (hier TODO: stap niet beschikbaar)', () => {
    const s = submitMeasurement(c, atMeting(), null, t(2));
    expect(s.path.at(-1)).toMatchObject({ evaluation: 'not-measured', value: null });
    expect(s.currentStepId).toBe('TODO');
    expect(currentStep(c, s)).toBeNull();
    expect(s.status).toBe('active');
  });

  it('zonder bereik: waarde vastgelegd zonder oordeel', () => {
    let s = answerQuestion(c, start(), 1, t(1));
    s = completeInstruction(c, s, t(2));
    s = submitMeasurement(c, s, 61.5, t(3));
    expect(s.path.at(-1)).toMatchObject({ evaluation: 'no-range', value: 61.5, unit: '°C' });
  });
});

describe('goBack', () => {
  it('op de eerste stap is er niets terug te nemen', () => {
    expect(goBack(c, start(), t(1))).toBeNull();
  });

  it('neemt de laatste beslissing terug', () => {
    const s = goBack(c, answerQuestion(c, start(), 0, t(1)), t(2));
    expect(s?.currentStepId).toBe('vraag-1');
    expect(s?.path).toEqual([]);
  });

  it('vanaf een uitkomst terug wist de uitkomst', () => {
    const done = submitMeasurement(c, answerQuestion(c, start(), 0, t(1)), 1.5, t(2));
    const s = goBack(c, done, t(3));
    expect(s?.status).toBe('active');
    expect(s?.outcome).toBeNull();
    expect(s?.currentStepId).toBe('meting-1');
  });

  it('na een bevestigde veiligheidsstop gaat terug naar de vraag die hem veroorzaakte', () => {
    const s = acknowledgeSafety(c, answerQuestion(c, start(), 2, t(1)), t(2));
    const back = goBack(c, s, t(3));
    expect(back?.currentStepId).toBe('vraag-1');
    expect(back?.path).toEqual([]);
  });
});

describe('abortSession', () => {
  it('zet de status op afgebroken en houdt het pad', () => {
    const s = abortSession(answerQuestion(c, start(), 0, t(1)), t(2));
    expect(s.status).toBe('aborted');
    expect(s.path).toHaveLength(1);
  });
});
