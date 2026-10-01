import type { Metadata } from 'next';
import { ReportScreen } from '@/features/service-report/ReportScreen';

export const metadata: Metadata = { title: 'Rapport' };

export default async function ReportPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <ReportScreen sessionId={sessionId} />;
}
