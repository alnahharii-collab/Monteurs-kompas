'use client';

import { FileClock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppHeader, HeaderTextButton } from '@/components/ui/AppHeader';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { SafetyStop } from '@/components/ui/SafetyStop';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { UNAVAILABLE_LABEL } from '@/domain/content';
import {
  abortSession,
  acknowledgeSafety,
  answerQuestion,
  completeInstruction,
  currentStep,
  goBack,
  stepNumber,
  submitMeasurement,
} from '@/domain/diagnosis/engine';
import type { DiagnosisSession } from '@/domain/diagnosis/types';
import { resolveSources } from '@/features/sources/useSources';
import { provider } from '@/services/diagnosis-provider';
import { DiagnosisStepView } from './DiagnosisStep';
import { OutcomeView } from './OutcomeView';
import { CaseMissing, Loading, SessionMissing } from './SessionMissing';
import { useSession } from './session-store';

const now = () => new Date().toISOString();

export function DiagnosisScreen({ sessionId }: { sessionId: string }) {
  const [state, save] = useSession(sessionId);
  const router = useRouter();
  const [stopOpen, setStopOpen] = useState(false);

  const aborted = state.status === 'ready' && state.session.status === 'aborted';
  useEffect(() => {
    if (aborted) router.replace(`/diagnose/${sessionId}/rapport`);
  }, [aborted, router, sessionId]);

  if (state.status === 'loading') return <Loading />;
  if (state.status === 'missing') return <SessionMissing />;

  const session = state.session;
  const diagnosisCase = provider.getCase(session.caseId);
  const appliance = provider.getAppliance(session.applianceId);
  if (!diagnosisCase) return <CaseMissing title={appliance?.shortName} />;
  if (aborted) return <Loading />;

  const deviceName = appliance?.shortName ?? session.applianceId;
  const step = currentStep(diagnosisCase, session);
  const report = `/diagnose/${session.id}/rapport`;
  const update = (next: DiagnosisSession) => save(next);

  const back = () => {
    if (session.status === 'safety-stop') return;
    const previous = goBack(diagnosisCase, session, now());
    if (previous) update(previous);
    else router.push(`/toestellen/${session.applianceId}/storing`);
  };

  const stopAndReport = () => {
    update(abortSession(session, now()));
    setStopOpen(false);
  };

  const finished = session.status === 'completed' && session.outcome;

  return (
    <>
      <Screen
        header={
          <AppHeader
            back={{ onClick: back, label: 'Vorige stap' }}
            title={deviceName}
            right={finished ? null : <HeaderTextButton onClick={() => setStopOpen(true)}>Stop</HeaderTextButton>}
          />
        }
        footer={finished ? <ButtonLink href={report}>Rapport maken</ButtonLink> : undefined}
      >
        <div className="pt-4">
          <ProgressIndicator step={stepNumber(session)} label={finished ? 'Diagnose klaar' : 'Diagnose actief'} />
        </div>

        {finished && session.outcome ? (
          <OutcomeView outcome={session.outcome} />
        ) : step && (step.type === 'question' || step.type === 'measurement' || step.type === 'instruction') ? (
          <DiagnosisStepView
            step={step}
            onAnswer={(i) => update(answerQuestion(diagnosisCase, session, i, now()))}
            onMeasure={(v) => update(submitMeasurement(diagnosisCase, session, v, now()))}
            onDone={() => update(completeInstruction(diagnosisCase, session, now()))}
          />
        ) : session.status === 'safety-stop' ? null : (
          <div className="flex flex-1 flex-col">
            <EmptyState icon={<FileClock size={24} />} title={UNAVAILABLE_LABEL} tone="warn">
              De vervolgstap voor deze situatie is nog niet aangeleverd. Ga een stap terug of stop en leg vast wat je hebt
              gevonden.
            </EmptyState>
            <div className="mt-auto flex flex-col gap-3 pb-4">
              <Button onClick={stopAndReport}>Stoppen en rapport maken</Button>
              <Button variant="secondary" onClick={back}>
                Stap terug
              </Button>
            </div>
          </div>
        )}
      </Screen>

      <Sheet open={stopOpen} onClose={() => setStopOpen(false)} title="Diagnose stoppen?">
        <p className="text-body text-ink-2">De stappen tot nu toe komen in het rapport.</p>
        <div className="mt-5 flex flex-col gap-3">
          <Button onClick={stopAndReport}>Stoppen en rapport maken</Button>
          <Button variant="secondary" onClick={() => setStopOpen(false)}>
            Verder met diagnose
          </Button>
        </div>
      </Sheet>

      {session.status === 'safety-stop' && session.pendingSafety ? (
        <SafetyStop
          key={`${session.pendingSafety.stepId}-${session.path.length}`}
          flag={session.pendingSafety.flag}
          sources={resolveSources(session.pendingSafety.flag.sourceIds)}
          deviceName={deviceName}
          onConfirm={() => update(acknowledgeSafety(diagnosisCase, session, now()))}
        />
      ) : null}
    </>
  );
}
