import { cx } from './cx';

/** Ontworpen foutstate: nooit leeg, nooit een stacktrace. */
export function EmptyState({
  icon,
  title,
  children,
  action,
  tone = 'neutral',
}: {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  tone?: 'neutral' | 'warn';
}) {
  return (
    <div className="flex flex-col items-start gap-3 py-8">
      <span
        aria-hidden
        className={cx(
          'flex size-touch items-center justify-center rounded-md',
          tone === 'warn' ? 'bg-warn-soft text-warn' : 'bg-ink/10 text-ink-2',
        )}
      >
        {icon}
      </span>
      <h2 className="text-title font-semibold text-ink">{title}</h2>
      {children ? <div className="text-body text-ink-2">{children}</div> : null}
      {action ? <div className="mt-2 w-full">{action}</div> : null}
    </div>
  );
}
