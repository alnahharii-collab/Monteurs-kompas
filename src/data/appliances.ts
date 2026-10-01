import type { Appliance } from '@/domain/appliance';

/** Demo-toestel uit de productbrief. Alleen naamgegevens; geen technische specificaties zonder bron. */
export const appliances: Appliance[] = [
  {
    id: 'intergas-kombi-kompakt-hre-24-18-a',
    manufacturer: 'Intergas',
    productFamily: 'Kombi Kompakt HRE',
    model: '24/18 A',
    name: 'Intergas Kombi Kompakt HRE 24/18 A',
    shortName: 'Intergas HRE 24/18 A',
    searchTerms: ['intergas', 'kombi kompakt', 'kompakt', 'hre', '24/18', '24-18', '2418', 'hre 24/18 a'],
  },
];
