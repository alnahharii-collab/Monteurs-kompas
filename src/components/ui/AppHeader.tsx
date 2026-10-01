import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

type BackAction = { href: string; label: string } | { onClick: () => void; label: string };

/** Compacte donkere header: ← terug · titel/toestel · rechteractie. */
export function AppHeader({
  back,
  title,
  subtitle,
  right,
}: {
  back?: BackAction;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const backClass =
    'flex size-touch shrink-0 items-center justify-center rounded-md text-header-ink transition-colors duration-(--duration-fast) active:bg-white/15';
  return (
    <header className="no-print sticky top-0 z-20 bg-header pt-[env(safe-area-inset-top)] text-header-ink">
      <div className="mx-auto flex h-14 w-full max-w-content items-center gap-1 px-2">
        {back ? (
          'href' in back ? (
            <Link href={back.href} aria-label={back.label} className={backClass}>
              <ChevronLeft aria-hidden size={26} strokeWidth={2.25} />
            </Link>
          ) : (
            <button type="button" onClick={back.onClick} aria-label={back.label} className={backClass}>
              <ChevronLeft aria-hidden size={26} strokeWidth={2.25} />
            </button>
          )
        ) : (
          <span className="w-2" />
        )}
        <div className="min-w-0 flex-1 px-1">
          {subtitle ? <p className="truncate text-label tracking-normal text-header-ink-2">{subtitle}</p> : null}
          <p className="truncate text-small font-semibold">{title}</p>
        </div>
        {right ? <div className="shrink-0">{right}</div> : <span className="w-2" />}
      </div>
    </header>
  );
}

export function HeaderTextButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-touch min-w-touch items-center justify-center rounded-md px-3 text-small font-semibold text-header-ink transition-colors duration-(--duration-fast) active:bg-white/15"
    >
      {children}
    </button>
  );
}
