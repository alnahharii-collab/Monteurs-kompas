import { cx } from './cx';

/** Vaste schermopbouw: header, content met vaste breedte, optionele actiezone in duimbereik. */
export function Screen({
  header,
  children,
  footer,
  className,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      {header}
      <main className={cx('mx-auto flex w-full max-w-content flex-1 flex-col px-gutter', className)}>{children}</main>
      {footer ? (
        <div className="no-print sticky bottom-0 z-10 border-t border-line bg-bg/95 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-content px-gutter pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        </div>
      ) : null}
    </div>
  );
}
