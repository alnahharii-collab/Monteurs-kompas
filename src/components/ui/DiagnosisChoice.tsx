import { Check } from 'lucide-react';
import { cx } from './cx';

/** Antwoord in de diagnose: volle breedte, ≥56px, gekozen staat = gevulde achtergrond + vinkje. */
export function DiagnosisChoice({
  label,
  selected,
  disabled,
  onSelect,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cx(
        'flex min-h-choice w-full items-center gap-3 rounded-md border-2 px-4 py-3 text-left text-body font-semibold transition-[background-color,border-color,color,transform] duration-(--duration-fast) active:scale-[0.99]',
        selected
          ? 'border-primary bg-primary text-on-primary'
          : 'border-line-strong bg-panel text-ink active:bg-primary-soft disabled:opacity-60',
      )}
    >
      <span className="flex-1">{label}</span>
      <span
        aria-hidden
        className={cx(
          'flex size-6 shrink-0 items-center justify-center rounded-full border-2',
          selected ? 'border-white bg-white text-primary' : 'border-line-strong',
        )}
      >
        {selected ? <Check size={16} strokeWidth={3} /> : null}
      </span>
    </button>
  );
}
