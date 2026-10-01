/**
 * Markering voor ontbrekende inhoud in de data. De UI toont dan
 * "Nog niet beschikbaar" in plaats van de waarde.
 */
export const TODO = 'TODO';
export const UNAVAILABLE_LABEL = 'Nog niet beschikbaar';

export function isTodo(value: string | undefined | null): boolean {
  return value === undefined || value === null || value.trim() === '' || value.trim().toUpperCase() === TODO;
}

export function displayText(value: string | undefined | null): string {
  return isTodo(value) ? UNAVAILABLE_LABEL : (value as string);
}
