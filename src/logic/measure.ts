export type ParseResult =
  | { status: 'empty' }
  | { status: 'invalid'; message: string }
  | { status: 'ok'; value: number };

/**
 * Leest een meetwaarde in Nederlandse notatie ("12,5") of met punt ("12.5").
 * Een leeg veld is GEEN nul: het levert status 'empty' op.
 */
export function parseMeasurement(raw: string): ParseResult {
  const text = raw.trim().replace(/\s+/g, '');
  if (text === '') return { status: 'empty' };
  if (!/^-?\d+([.,]\d+)?$/.test(text)) {
    return { status: 'invalid', message: 'Gebruik alleen cijfers en één komma, bijvoorbeeld 12,5.' };
  }
  const value = Number(text.replace(',', '.'));
  if (!Number.isFinite(value)) {
    return { status: 'invalid', message: 'Dit is geen geldige meetwaarde.' };
  }
  if (value < 0) {
    return { status: 'invalid', message: 'Een negatieve waarde is hier niet mogelijk.' };
  }
  return { status: 'ok', value };
}

export function formatNumber(value: number): string {
  return value.toLocaleString('nl-NL', { maximumFractionDigits: 3 });
}

export function formatRange(min: number | undefined, max: number | undefined, unit: string): string | undefined {
  if (min !== undefined && max !== undefined) return `${formatNumber(min)} – ${formatNumber(max)} ${unit}`;
  if (max !== undefined) return `maximaal ${formatNumber(max)} ${unit}`;
  if (min !== undefined) return `minimaal ${formatNumber(min)} ${unit}`;
  return undefined;
}

export function inRange(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}
