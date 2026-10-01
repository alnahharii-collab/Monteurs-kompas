'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MeasurementInput } from '@/components/ui/MeasurementInput';
import { StatusLabel } from '@/components/ui/StatusLabel';
import { evaluateMeasurement, formatNumber, parseMeasurementInput, type ParseResult } from '@/domain/diagnosis/measurement';
import type { MeasurementStep } from '@/domain/diagnosis/types';
import { provider } from '@/services/diagnosis-provider';

function errorText(result: Extract<ParseResult, { ok: false }>, unit: string): string | null {
  switch (result.error) {
    case 'empty':
      return null;
    case 'not-a-number':
      return 'Ongeldige waarde. Gebruik alleen cijfers, met komma of punt.';
    case 'below-limit':
      return `Ongeldige waarde: kan niet lager zijn dan ${formatNumber(result.limit ?? 0)} ${unit}.`;
    case 'above-limit':
      return `Ongeldige waarde: kan niet hoger zijn dan ${formatNumber(result.limit ?? 0)} ${unit}.`;
  }
}

export function MeasurementForm({ step, onSubmit }: { step: MeasurementStep; onSubmit: (value: number | null) => void }) {
  const [raw, setRaw] = useState('');
  const [touched, setTouched] = useState(false);
  const result = parseMeasurementInput(raw, step);
  // Een bereik telt alleen mee als de bron ervan bestaat.
  const range = step.range && provider.getSource(step.range.sourceId) ? step.range : undefined;
  const error = !result.ok && (touched || result.error !== 'empty') ? errorText(result, step.unit) : null;
  const evaluation = result.ok ? evaluateMeasurement({ range }, result.value) : null;

  const status = range ? (
    <div className="flex flex-wrap items-center gap-2">
      <span className="tabular text-small text-ink-2">
        Verwacht {formatNumber(range.min)}–{formatNumber(range.max)} {step.unit}
      </span>
      {evaluation === 'in-range' ? <StatusLabel tone="ok">Binnen bereik</StatusLabel> : null}
      {evaluation === 'out-of-range' ? <StatusLabel tone="warn">Buiten bereik</StatusLabel> : null}
    </div>
  ) : (
    <p className="text-small text-ink-3">Geen bereik bekend. De waarde wordt vastgelegd zonder oordeel.</p>
  );

  const submit = () => {
    setTouched(true);
    if (result.ok) onSubmit(result.value);
  };

  return (
    <div className="flex flex-col gap-3">
      <MeasurementInput
        label={step.quantity}
        unit={step.unit}
        value={raw}
        onChange={setRaw}
        error={error}
        status={status}
        onSubmit={submit}
      />
      <Button onClick={submit} disabled={!result.ok}>
        Waarde vastleggen
      </Button>
      <Button variant="secondary" onClick={() => onSubmit(null)}>
        Niet gemeten
      </Button>
    </div>
  );
}
