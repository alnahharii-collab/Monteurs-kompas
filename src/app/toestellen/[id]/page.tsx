import type { Metadata } from 'next';
import { AppHeader } from '@/components/ui/AppHeader';
import { DeviceHeader } from '@/components/ui/DeviceHeader';
import { Screen } from '@/components/ui/Screen';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { ApplianceActions } from '@/features/appliances/ApplianceActions';
import { ApplianceNotFound } from '@/features/appliances/ApplianceNotFound';
import { provider } from '@/services/diagnosis-provider';

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return provider.listAppliances().map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  return { title: provider.getAppliance(id)?.shortName ?? 'Toestel niet gevonden' };
}

export default async function AppliancePage({ params }: Params) {
  const { id } = await params;
  const appliance = provider.getAppliance(id);
  if (!appliance) return <ApplianceNotFound />;

  return (
    <Screen header={<AppHeader back={{ href: '/toestellen', label: 'Terug naar toestellen' }} title={appliance.shortName} />}>
      <DeviceHeader appliance={appliance} />
      <SectionLabel className="mb-2">Wat ga je doen?</SectionLabel>
      <ApplianceActions applianceId={appliance.id} />
    </Screen>
  );
}
