import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cx } from './cx';

/**
 * Een actie als rij: icoon, titel, toelichting, chevron.
 * `emphasis="primary"` maakt de dominante actie van het scherm.
 */
export function ActionControl({
  href,
  icon,
  title,
  description,
  emphasis = 'default',
  meta,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  emphasis?: 'primary' | 'default';
  meta?: React.ReactNode;
}) {
  const primary = emphasis === 'primary';
  return (
    <Link
      href={href}
      className={cx(
        'group flex min-h-[4.5rem] items-center gap-4 rounded-lg px-4 py-3 transition-[background-color,transform] duration-(--duration-fast) active:scale-[0.99]',
        primary ? 'bg-primary text-on-primary active:bg-primary-pressed' : 'bg-panel text-ink active:bg-surface',
      )}
    >
      <span
        aria-hidden
        className={cx(
          'flex size-touch shrink-0 items-center justify-center rounded-md',
          primary ? 'bg-white/15' : 'bg-primary-soft text-primary',
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-title font-semibold">{title}</span>
        {description ? (
          <span className={cx('block text-small', primary ? 'text-white/80' : 'text-ink-3')}>{description}</span>
        ) : null}
        {meta}
      </span>
      <ChevronRight aria-hidden size={22} className={primary ? 'text-white/80' : 'text-ink-3'} />
    </Link>
  );
}
