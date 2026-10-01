'use client';

import { Wrench } from 'lucide-react';
import { ActionControl } from '@/components/ui/ActionControl';
import { ResumeAction } from '@/features/diagnosis/ResumeAction';
import { latestOpenSession, useSessions } from '@/features/diagnosis/session-store';

/** Toestel gekozen → acties. Lopende diagnose wordt dominant; anders "Storing oplossen". */
export function ApplianceActions({ applianceId }: { applianceId: string }) {
  const sessions = useSessions();
  const open = sessions ? latestOpenSession(sessions, applianceId) : null;
  return (
    <div className="flex flex-col gap-3">
      {open ? <ResumeAction applianceId={applianceId} /> : null}
      <ActionControl
        href={`/toestellen/${applianceId}/storing`}
        emphasis={open ? 'default' : 'primary'}
        icon={<Wrench size={22} />}
        title={open ? 'Nieuwe storing' : 'Storing oplossen'}
        description="Foutcode of symptoom kiezen"
      />
    </div>
  );
}
