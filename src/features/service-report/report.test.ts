import { describe, expect, it } from 'vitest';
import fixture from '../../../tests/fixtures/testcasus.case.json';
import { appliances } from '@/data/appliances';
import { acknowledgeSafety, answerQuestion, completeInstruction, createSession, submitMeasurement } from '@/domain/diagnosis/engine';
import type { DiagnosisCaseFile } from '@/domain/diagnosis/types';
import { reportLines, reportText } from './report';

const file = fixture as DiagnosisCaseFile;
const c = file.case;
const now = '2026-01-01T10:00:00.000Z';

describe('report', () => {
  it('beschrijft het pad met antwoorden, metingen en veiligheidsbevestiging', () => {
    let s = createSession({ id: 'r', diagnosisCase: c, now });
    s = answerQuestion(c, s, 2, now);
    s = acknowledgeSafety(c, s, now);
    s = completeInstruction(c, s, now);
    s = submitMeasurement(c, s, 61.5, now);
    const lines = reportLines(c, s);
    expect(lines.map((l) => l.answer)).toEqual([
      'Test veiligheid',
      'Bevestigd: Testactie: bevestig om de flow te testen.',
      'Uitgevoerd',
      '61,5 °C',
    ]);
    expect(lines[1]?.question).toMatch(/^VEILIGHEIDSSTOP — Gaslekkage/);

    const text = reportText({ appliance: appliances[0] ?? null, diagnosisCase: c, session: s, sources: () => null });
    expect(text).toContain('Toestel: Intergas Kombi Kompakt HRE 24/18 A');
    expect(text).toContain('Controle: Nog niet beschikbaar');
    expect(text).toContain('Bron: Bron niet beschikbaar');
  });
});
