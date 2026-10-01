import { describe, expect, it } from 'vitest';
import { appliances } from '@/data/appliances';
import { searchAppliances } from './search';

describe('searchAppliances', () => {
  it.each(['intergas', 'HRE 24/18', 'kombi kompakt', '2418', 'Intergas hre'])('vindt het demotoestel op "%s"', (q) => {
    expect(searchAppliances(appliances, q)).toHaveLength(1);
  });
  it('geeft niets bij een ander merk', () => {
    expect(searchAppliances(appliances, 'remeha')).toEqual([]);
  });
  it('lege zoekvraag geeft alles', () => {
    expect(searchAppliances(appliances, '  ')).toEqual(appliances);
  });
});
