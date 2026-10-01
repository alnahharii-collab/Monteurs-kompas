import type { Metadata } from 'next';
import { DiagnosisScreen } from '@/features/diagnosis/DiagnosisScreen';

export const metadata: Metadata = { title: 'Diagnose' };

export default async function DiagnosisPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <DiagnosisScreen sessionId={sessionId} />;
}
