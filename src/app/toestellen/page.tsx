import type { Metadata } from 'next';
import { AppHeader } from '@/components/ui/AppHeader';
import { Screen } from '@/components/ui/Screen';
import { ApplianceSearch } from '@/features/search/ApplianceSearch';

export const metadata: Metadata = { title: 'Toestellen' };

export default async function AppliancesPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  return (
    <Screen header={<AppHeader back={{ href: '/', label: 'Terug naar start' }} title="Toestellen" />}>
      <h1 className="pt-6 pb-4 text-question font-semibold">Toestel zoeken</h1>
      <ApplianceSearch initialQuery={typeof q === 'string' ? q : ''} autoFocus />
    </Screen>
  );
}
