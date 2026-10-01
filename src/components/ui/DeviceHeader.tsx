import type { Appliance } from '@/domain/appliance';

/** Toestelidentiteit bovenaan een toestelscherm. */
export function DeviceHeader({ appliance, context }: { appliance: Appliance; context?: string }) {
  return (
    <div className="pt-6 pb-5">
      <p className="text-label font-semibold uppercase tracking-label text-ink-3">{context ?? appliance.manufacturer}</p>
      <h1 className="mt-1 text-question font-semibold text-ink">{appliance.name}</h1>
    </div>
  );
}
