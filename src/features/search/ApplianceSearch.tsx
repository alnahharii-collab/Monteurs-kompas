'use client';

import { ChevronRight, SearchX } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { provider } from '@/services/diagnosis-provider';

export function ApplianceSearch({ initialQuery = '', autoFocus }: { initialQuery?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const results = useMemo(() => provider.searchAppliances(query), [query]);
  const all = provider.listAppliances();

  return (
    <div>
      <SearchInput
        label="Zoek toestel"
        placeholder="Merk, type of model"
        value={query}
        onChange={setQuery}
        autoFocus={autoFocus}
        onSubmit={() => {
          const only = results.length === 1 ? results[0] : undefined;
          if (only) router.push(`/toestellen/${only.id}`);
        }}
      />

      {results.length === 0 ? (
        <EmptyState icon={<SearchX size={24} />} title="Geen toestel gevonden">
          <p>
            Niets gevonden voor <span className="font-semibold text-ink">“{query.trim()}”</span>.
          </p>
          <p className="mt-2">
            Monteur Kompas bevat nu {all.length === 1 ? 'één toestel' : `${all.length} toestellen`}:{' '}
            {all.map((a) => a.name).join(', ')}.
          </p>
        </EmptyState>
      ) : (
        <section className="mt-6" aria-label="Zoekresultaten">
          <SectionLabel>{query.trim() ? `${results.length} gevonden` : 'Beschikbare toestellen'}</SectionLabel>
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {results.map((appliance) => (
              <li key={appliance.id}>
                <Link
                  href={`/toestellen/${appliance.id}`}
                  className="flex min-h-choice items-center gap-3 py-3 transition-colors duration-(--duration-fast) active:bg-ink/5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-label font-semibold uppercase tracking-label text-ink-3">
                      {appliance.manufacturer}
                    </span>
                    <span className="block text-body font-semibold text-ink">
                      {appliance.productFamily} {appliance.model}
                    </span>
                  </span>
                  <ChevronRight aria-hidden size={22} className="shrink-0 text-ink-3" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
