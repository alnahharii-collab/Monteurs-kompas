import { describe, expect, it } from 'vitest';
import { evaluateMeasurement, parseDecimal, parseMeasurementInput } from './measurement';

describe('parseDecimal', () => {
  it.each([
    ['1,5', 1.5],
    ['1.5', 1.5],
    [' 12 ', 12],
    [',5', 0.5],
    ['-3,2', -3.2],
    ['7,', 7],
  ])('%s → %d', (raw, expected) => {
    expect(parseDecimal(raw)).toBe(expected);
  });

  it('leeg → null', () => expect(parseDecimal('  ')).toBeNull());
  it.each(['abc', '1,2,3', '1.2.3', '1e5', '--1', '1 000,5'])('%s is geen getal', (raw) => {
    expect(parseDecimal(raw)).toBeNaN();
  });
});

describe('parseMeasurementInput', () => {
  it('weigert onder het absolute nulpunt', () => {
    expect(parseMeasurementInput('-300', { unit: '°C' })).toEqual({ ok: false, error: 'below-limit', limit: -273.15 });
  });
  it('weigert percentages buiten 0–100', () => {
    expect(parseMeasurementInput('101', { unit: '%' })).toMatchObject({ ok: false, error: 'above-limit' });
  });
  it('gebruikt grenzen uit de data', () => {
    expect(parseMeasurementInput('-1', { unit: 'bar', limits: { min: 0 } })).toMatchObject({ ok: false });
    expect(parseMeasurementInput('0,8', { unit: 'bar', limits: { min: 0 } })).toEqual({ ok: true, value: 0.8 });
  });
  it('meldt lege invoer en tekst', () => {
    expect(parseMeasurementInput('', { unit: 'bar' })).toEqual({ ok: false, error: 'empty' });
    expect(parseMeasurementInput('x', { unit: 'bar' })).toEqual({ ok: false, error: 'not-a-number' });
  });
});

describe('evaluateMeasurement', () => {
  const range = { min: 1, max: 2, sourceId: 'b' };
  it('zonder bereik geen oordeel', () => expect(evaluateMeasurement({}, 5)).toBe('no-range'));
  it('niet gemeten', () => expect(evaluateMeasurement({ range }, null)).toBe('not-measured'));
  it('binnen / buiten', () => {
    expect(evaluateMeasurement({ range }, 1)).toBe('in-range');
    expect(evaluateMeasurement({ range }, 2.01)).toBe('out-of-range');
  });
});
