/** Voortgang zonder totaal (flow is dynamisch): genomen stappen + huidige stap. */
export function ProgressIndicator({ step, label = 'Diagnose actief' }: { step: number; label?: string }) {
  const done = Math.max(0, step - 1);
  const shown = Math.min(done, 12);
  return (
    <div className="flex items-center gap-3">
      <p className="text-small font-semibold text-ink-2">
        {label} · <span className="tabular text-ink">Stap {step}</span>
      </p>
      <div aria-hidden className="flex flex-1 items-center gap-1 overflow-hidden">
        {Array.from({ length: shown }, (_, i) => (
          <span key={i} className="h-1.5 w-4 shrink-0 rounded-full bg-primary/45" />
        ))}
        <span className="h-1.5 w-7 shrink-0 rounded-full bg-primary" />
      </div>
    </div>
  );
}
