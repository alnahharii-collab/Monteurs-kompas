import { Disclosure } from '@/components/ui/Disclosure';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SourceReference, SourceTypeBadge } from '@/components/ui/SourceReference';
import { StatusLabel } from '@/components/ui/StatusLabel';
import { displayText } from '@/domain/content';
import type { SessionOutcome } from '@/domain/diagnosis/types';
import { resolveSources } from '@/features/sources/useSources';

export function OutcomeView({ outcome }: { outcome: SessionOutcome }) {
  const sources = resolveSources(outcome.sourceIds);
  const safety = outcome.kind === 'safety';
  return (
    <div className="step-enter flex flex-col">
      <div className="flex items-center justify-between pt-6">
        <SectionLabel tone="primary">Conclusie</SectionLabel>
        {safety ? <StatusLabel tone="danger">Veiligheidsstop</StatusLabel> : <StatusLabel tone="ok">Diagnose klaar</StatusLabel>}
      </div>
      <h1 className="mt-2 text-question font-semibold">{displayText(outcome.cause)}</h1>

      <dl className="mt-6 divide-y divide-line border-y border-line">
        <div className="py-4">
          <dt className="text-label font-semibold uppercase tracking-label text-ink-3">{safety ? 'Veiligheidsactie' : 'Actie'}</dt>
          <dd className="mt-1 text-body font-medium text-ink">{displayText(outcome.action)}</dd>
        </div>
        {!safety ? (
          <div className="py-4">
            <dt className="text-label font-semibold uppercase tracking-label text-ink-3">Controle na herstel</dt>
            <dd className="mt-1 text-body font-medium text-ink">{displayText(outcome.verification)}</dd>
          </div>
        ) : null}
      </dl>
      <div className="border-b border-line">
        <Disclosure title="Bron" aside={<SourceTypeBadge type={sources.find((s) => s !== null)?.type ?? null} />}>
          <SourceReference sources={sources} />
        </Disclosure>
      </div>
    </div>
  );
}
