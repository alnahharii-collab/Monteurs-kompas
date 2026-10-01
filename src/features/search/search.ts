import type { Appliance } from '@/domain/appliance';

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Alle zoekwoorden moeten ergens in naam of zoektermen voorkomen. */
export function searchAppliances(list: Appliance[], query: string): Appliance[] {
  const words = normalize(query).split(' ').filter(Boolean);
  if (words.length === 0) return list;
  return list.filter((appliance) => {
    const haystack = normalize([appliance.name, appliance.manufacturer, appliance.model, ...appliance.searchTerms].join(' '));
    const compact = haystack.replace(/ /g, '');
    return words.every((w) => haystack.includes(w) || compact.includes(w));
  });
}
