import type { MeasurementEvaluation, MeasurementStep, PhysicalLimits } from './types';

/** Grenzen die volgen uit natuurkunde of definitie van de eenheid, niet uit een toestel. */
const UNIT_LIMITS: Record<string, PhysicalLimits> = {
  '°C': { min: -273.15 },
  K: { min: 0 },
  '%': { min: 0, max: 100 },
  ppm: { min: 0 },
};

export type ParseResult =
  | { ok: true; value: number }
  | { ok: false; error: 'empty' | 'not-a-number' | 'below-limit' | 'above-limit'; limit?: number };

/** Accepteert komma én punt als decimaalteken. Geen duizendtalscheiding. */
export function parseDecimal(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  if (!/^[-+]?(\d+([.,]\d*)?|[.,]\d+)$/.test(trimmed)) return Number.NaN;
  const value = Number(trimmed.replace(',', '.'));
  return Number.isFinite(value) ? value : Number.NaN;
}

export function physicalLimitsFor(step: Pick<MeasurementStep, 'unit' | 'limits'>): PhysicalLimits {
  const unitLimits = UNIT_LIMITS[step.unit] ?? {};
  const own = step.limits ?? {};
  return {
    min: maxDefined(unitLimits.min, own.min),
    max: minDefined(unitLimits.max, own.max),
  };
}

export function parseMeasurementInput(
  raw: string,
  step: Pick<MeasurementStep, 'unit' | 'limits'>,
): ParseResult {
  const value = parseDecimal(raw);
  if (value === null) return { ok: false, error: 'empty' };
  if (Number.isNaN(value)) return { ok: false, error: 'not-a-number' };
  const limits = physicalLimitsFor(step);
  if (limits.min !== undefined && value < limits.min) return { ok: false, error: 'below-limit', limit: limits.min };
  if (limits.max !== undefined && value > limits.max) return { ok: false, error: 'above-limit', limit: limits.max };
  return { ok: true, value };
}

/** Oordeel alleen als er een bereik met bron in de data staat. */
export function evaluateMeasurement(
  step: Pick<MeasurementStep, 'range'>,
  value: number | null,
): MeasurementEvaluation {
  if (value === null) return 'not-measured';
  if (!step.range) return 'no-range';
  return value >= step.range.min && value <= step.range.max ? 'in-range' : 'out-of-range';
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 3 }).format(value);
}

function maxDefined(a: number | undefined, b: number | undefined): number | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  return Math.max(a, b);
}

function minDefined(a: number | undefined, b: number | undefined): number | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  return Math.min(a, b);
}
