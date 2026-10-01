import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';
import { cx } from './cx';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const base =
  'inline-flex min-h-choice w-full select-none items-center justify-center gap-2 rounded-md px-5 text-body font-semibold transition-[background-color,transform,color] duration-(--duration-fast) ease-(--ease-standard) active:scale-[0.985] disabled:pointer-events-none aria-disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary active:bg-primary-pressed disabled:bg-line disabled:text-ink-3 aria-disabled:bg-line aria-disabled:text-ink-3',
  secondary:
    'border-2 border-ink/80 bg-transparent text-ink active:bg-ink/10 disabled:border-line disabled:text-ink-3',
  danger: 'bg-danger text-white active:bg-danger-pressed disabled:bg-danger/40',
  ghost: 'text-primary underline-offset-4 active:bg-primary-soft',
};

export function Button({
  variant = 'primary',
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(base, variants[variant], className)}
    >
      {loading ? <LoaderCircle aria-hidden className="animate-spin" size={20} /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  className,
  children,
  href,
}: {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className={cx(base, variants[variant], className)}>
      {children}
    </Link>
  );
}
