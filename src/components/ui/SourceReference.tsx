import { SOURCE_MISSING_LABEL, SOURCE_TYPE_LABEL, type Source, type SourceType } from '@/domain/sources';
import { cx } from './cx';

const typeTone: Record<SourceType, string> = {
  manufacturer: 'bg-primary-soft text-primary',
  standard: 'bg-ink/10 text-ink',
  field: 'bg-field-soft text-field',
  general: 'bg-ink/10 text-ink-2',
};

export function SourceTypeBadge({ type }: { type: SourceType | null }) {
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center rounded-sm px-2 py-0.5 text-label font-semibold uppercase tracking-label',
        type ? typeTone[type] : 'bg-warn-soft text-warn',
      )}
    >
      {type ? SOURCE_TYPE_LABEL[type] : SOURCE_MISSING_LABEL}
    </span>
  );
}

/** Bron met bronlabel. Geen bron → "Bron niet beschikbaar". */
export function SourceReference({ sources }: { sources: Array<Source | null> }) {
  const known = sources.filter((s): s is Source => s !== null);
  if (known.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <SourceTypeBadge type={null} />
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {known.map((source) => (
        <li key={source.id} className="flex flex-col items-start gap-1">
          <SourceTypeBadge type={source.type} />
          <span className="text-body text-ink">{source.title}</span>
          {source.document || source.page ? (
            <span className="text-small text-ink-3">
              {source.document}
              {source.page ? ` · p. ${source.page}` : ''}
            </span>
          ) : null}
          {source.note ? <span className="text-small text-ink-3">{source.note}</span> : null}
        </li>
      ))}
    </ul>
  );
}
