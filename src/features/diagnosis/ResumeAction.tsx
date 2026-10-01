'use client';

import { RotateCcw } from 'lucide-react';
import { ActionControl } from '@/components/ui/ActionControl';
import { stepNumber } from '@/domain/diagnosis/engine';
import { formatDateTime } from '@/features/service-report/report';
import { provider } from '@/services/diagnosis-provider';
import { latestOpenSession, useSessions } from './session-store';

/** Toont "Diagnose hervatten" als er een lopende sessie is (optioneel voor één toestel). */
export function ResumeAction({ applianceId, fallback }: { applianceId?: string; fallback?: React.ReactNode }) {
  const sessions = useSessions();
  if (sessions === undefined) return null;
  const session = latestOpenSession(sessions, applianceId);
  if (!session) return <>{fallback}</>;
  const appliance = provider.getAppliance(session.applianceId);
  const diagnosisCase = provider.getCase(session.caseId);
  return (
    <ActionControl
      href={`/diagnose/${session.id}`}
      emphasis="primary"
      icon={<RotateCcw size={22} />}
      title="Diagnose hervatten"
      description={`${applianceId ? '' : `${appliance?.shortName ?? 'Onbekend toestel'} · `}Stap ${stepNumber(session)}${
        diagnosisCase ? ` · ${diagnosisCase.title}` : ''
      }`}
      meta={<span className="block text-small text-white/70">Gestart {formatDateTime(session.startedAt)}</span>}
    />
  );
}
