import { cx } from './cx';

export function SectionLabel({ children, className, tone = 'muted' }: { children: React.ReactNode; className?: string; tone?: 'muted' | 'primary' }) {
  return (
    <p
      className={cx(
        'text-label font-semibold uppercase tracking-label',
        tone === 'primary' ? 'text-primary' : 'text-ink-3',
        className,
      )}
    >
      {children}
    </p>
  );
}
