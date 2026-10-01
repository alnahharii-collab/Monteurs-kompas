import { describe, expect, it } from 'vitest';
import fixture from '../../../tests/fixtures/testcasus.case.json';
import type { DiagnosisCaseFile } from './types';
import { validateCaseFile } from './validate';

const base = fixture as DiagnosisCaseFile;
const clone = (): DiagnosisCaseFile => structuredClone(base);
const errors = (f: DiagnosisCaseFile) => validateCaseFile(f).filter((i) => i.level === 'error');

describe('validateCaseFile', () => {
  it('de testcasus heeft geen fouten, wel TODO-meldingen', () => {
    const issues = validateCaseFile(base);
    expect(issues.filter((i) => i.level === 'error')).toEqual([]);
    expect(issues.filter((i) => i.level === 'todo').map((i) => i.where)).toEqual([
      'stap meting-1 (onbekend)',
      'stap uitkomst-1',
    ]);
  });

  it('onbekende vervolgstap is een fout', () => {
    const f = clone();
    const step = f.case.steps['instructie-1'];
    if (step?.type === 'instruction') step.next = 'bestaat-niet';
    expect(errors(f)[0]?.message).toMatch(/onbekende stap/);
  });

  it('onbekende bron is een fout', () => {
    const f = clone();
    f.case.steps['vraag-1']!.sourceIds = ['verzonnen'];
    expect(errors(f)[0]?.message).toMatch(/Onbekende bron/);
  });

  it('fabrikantbron zonder document of pagina is een fout', () => {
    const f = clone();
    f.sources.push({ id: 'fab', type: 'manufacturer', title: 'Handleiding' });
    expect(errors(f).map((e) => e.message)).toEqual([
      'Fabrikantbron zonder document in content/docs/.',
      'Fabrikantbron zonder gecontroleerd paginanummer.',
    ]);
  });

  it('bereik met onbekende bron is een fout', () => {
    const f = clone();
    const step = f.case.steps['meting-1'];
    if (step?.type === 'measurement' && step.range) step.range.sourceId = 'x';
    expect(errors(f)[0]?.message).toMatch(/Bereik zonder geldige bron/);
  });

  it('casus zonder symptomen en foutcodes is een fout', () => {
    const f = clone();
    f.case.symptoms = [];
    f.case.errorCodes = [];
    expect(errors(f)).toHaveLength(1);
  });

  it('onbereikbare stap is een waarschuwing', () => {
    const f = clone();
    f.case.steps['los'] = { type: 'instruction', id: 'los', prompt: 'x', next: 'vraag-1', sourceIds: [] };
    expect(validateCaseFile(f).find((i) => i.level === 'warning')?.where).toBe('stap los');
  });
});
