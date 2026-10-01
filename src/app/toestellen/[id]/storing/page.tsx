import type { Metadata } from 'next';
import { ApplianceNotFound } from '@/features/appliances/ApplianceNotFound';
import { ComplaintPicker } from '@/features/diagnosis/ComplaintPicker';
import { provider } from '@/services/diagnosis-provider';

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return provider.listAppliances().map((a) => ({ id: a.id }));
}

export const metadata: Metadata = { title: 'Storing' };

export default async function ComplaintPage({ params }: Params) {
  const { id } = await params;
  const appliance = provider.getAppliance(id);
  if (!appliance) return <ApplianceNotFound />;
  return <ComplaintPicker applianceId={appliance.id} />;
}
