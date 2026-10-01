'use client';

import { useEffect, useRef } from 'react';

/** Bottom sheet op basis van <dialog>. Sluit met Escape of tik buiten de sheet. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-x-0 top-auto bottom-0 m-0 mx-auto w-full max-w-content max-h-none rounded-t-lg bg-panel p-0 text-ink shadow-sheet backdrop:bg-ink/50"
    >
      <div className="px-gutter pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div aria-hidden className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />
        <h2 className="text-title font-semibold">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  );
}
