'use client';

import { useId } from 'react';
import { cx } from './cx';

/** Grote numerieke invoer met vaste eenheid. Validatie gebeurt in de domeinlaag. */
export function MeasurementInput({
  value,
  onChange,
  unit,
  label,
  error,
  status,
  autoFocus,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  unit: string;
  label: string;
  error?: string | null;
  status?: React.ReactNode;
  autoFocus?: boolean;
  onSubmit?: () => void;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="text-label font-semibold uppercase tracking-label text-ink-3">
        {label}
      </label>
      <div
        className={cx(
          'mt-2 flex items-baseline gap-3 rounded-md border-2 bg-panel px-4 py-3 transition-colors duration-(--duration-fast)',
          error ? 'border-danger' : 'border-line-strong focus-within:border-primary',
        )}
      >
        <input
          id={id}
          type="text"
          inputMode="decimal"
          enterKeyHint="done"
          autoComplete="off"
          autoFocus={autoFocus}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit?.();
          }}
          placeholder="—"
          className="tabular min-w-0 flex-1 bg-transparent font-mono text-value font-semibold text-ink outline-none placeholder:text-line-strong"
        />
        <span className="shrink-0 text-title font-semibold text-ink-2">{unit}</span>
      </div>
      <div className="mt-2 min-h-6">
        {error ? (
          <p id={errorId} role="alert" className="text-small font-semibold text-danger">
            {error}
          </p>
        ) : (
          status
        )}
      </div>
    </div>
  );
}
