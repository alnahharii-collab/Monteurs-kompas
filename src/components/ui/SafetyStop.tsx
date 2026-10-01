'use client';

import { OctagonAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { displayText } from '@/domain/content';
import { SAFETY_CATEGORY_LABEL, type SafetyFlag } from '@/domain/safety';
import type { Source } from '@/domain/sources';
import { SourceReference } from './SourceReference';

/**
 * Volledig STOP-scherm. Niet weg te tikken: geen sluitknop, Escape doet niets.
 * Alleen verder via expliciete bevestiging.
 */
export function SafetyStop({
  flag,
  sources,
  deviceName,
  onConfirm,
}: {
  flag: SafetyFlag;
  sources: Array<Source | null>;
  deviceName: string;
  onConfirm: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="safety-title"
      aria-describedby="safety-reason"
      onCancel={(e) => e.preventDefault()}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-danger p-0 text-white backdrop:bg-danger"
    >
      <div className="mx-auto flex min-h-full w-full max-w-content flex-col px-gutter pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <OctagonAlert aria-hidden size={40} strokeWidth={2.25} />
          <p className="text-[2.5rem] leading-none font-bold tracking-wide">STOP</p>
        </div>
        <h1 id="safety-title" className="mt-4 text-question font-bold">
          Installatie niet verder in bedrijf stellen
        </h1>
        <p className="mt-1 text-small font-medium text-white/85">
          {SAFETY_CATEGORY_LABEL[flag.category]} · {deviceName}
        </p>

        <section className="mt-6">
          <p className="text-label font-semibold uppercase tracking-label text-white/80">Reden</p>
          <p id="safety-reason" className="mt-1 text-body font-medium">
            {displayText(flag.reason)}
          </p>
        </section>

        <section className="mt-5 rounded-md bg-white p-4 text-ink">
          <p className="text-label font-semibold uppercase tracking-label text-danger">Verplichte veiligheidsactie</p>
          <p className="mt-1 text-body font-semibold">{displayText(flag.action)}</p>
        </section>

        <section className="mt-5">
          <p className="mb-2 text-label font-semibold uppercase tracking-label text-white/80">Bron</p>
          <div className="rounded-md bg-white/95 p-3">
            <SourceReference sources={sources} />
          </div>
        </section>

        <div className="mt-auto pt-6">
          <label className="flex min-h-choice cursor-pointer items-center gap-3 rounded-md border-2 border-white/70 px-4 py-3">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="size-6 shrink-0 accent-white"
            />
            <span className="text-body font-semibold">Ik heb de veiligheidsactie uitgevoerd of geregeld</span>
          </label>
          <button
            type="button"
            disabled={!checked}
            onClick={onConfirm}
            className="mt-3 flex min-h-choice w-full items-center justify-center rounded-md bg-white px-5 text-body font-bold text-danger transition-[opacity,transform] duration-(--duration-fast) active:scale-[0.985] disabled:opacity-45"
          >
            Bevestigen
          </button>
        </div>
      </div>
    </dialog>
  );
}
