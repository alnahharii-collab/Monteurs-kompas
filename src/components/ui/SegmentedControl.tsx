'use client';

import { cx } from './cx';

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-md bg-ink/10 p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cx(
              'h-touch flex-1 rounded-sm text-small font-semibold transition-[background-color,color,box-shadow] duration-(--duration-fast)',
              selected ? 'bg-panel text-ink shadow-[0_1px_3px_rgb(15_20_27/0.18)]' : 'text-ink-2 active:bg-ink/10',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
