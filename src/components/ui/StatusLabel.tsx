import { cx } from './cx';

export type StatusTone = 'neutral' | 'active' | 'ok' | 'warn' | 'danger' | 'field';

const tones: Record<StatusTone, string> = {
  neutral: 'bg-ink/10 text-ink-2',
  active: 'bg-primary-soft text-primary',
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
  field: 'bg-field-soft text-field',
};

/** Status altijd in woord én kleur. */
export function StatusLabel({ tone, children, className }: { tone: StatusTone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-small font-semibold',
        tones[tone],
        className,
      )}
    >
      <span aria-hidden className="size-2 rounded-full bg-current" />
      {children}
    </span>
  );
}
