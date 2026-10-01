'use client';

import { Check, Copy, Printer } from 'lucide-react';
import { useState } from 'react';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SourceReference } from '@/components/ui/SourceReference';
import { StatusLabel, type StatusTone } from '@/components/ui/StatusLabel';
import { displayText } from '@/domain/content';
import { isFinished, setNotes } from '@/domain/diagnosis/engine';
import type { DiagnosisSession } from '@/domain/diagnosis/types';
import { CaseMissing, Loading, SessionMissing } from '@/features/diagnosis/SessionMissing';
import { useSession } from '@/features/diagnosis/session-store';
import { resolveSources } from '@/features/sources/useSources';
import { provider } from '@/services/diagnosis-provider';
import { formatDateTime, reportLines, reportText, STATUS_LABEL } from './report';

const STATUS_TONE: Record<DiagnosisSession['status'], StatusTone> = {
  active: 'active',
  'safety-stop': 'danger',
  completed: 'ok',
  aborted: 'warn',
};

export function ReportScreen({ sessionId }: { sessionId: string }) {
  const [state, save] = useSession(sessionId);
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');

  if (state.status === 'loading') return <Loading />;
  if (state.status === 'missing') return <SessionMissing title="Rapport" />;
  const session = state.session;
  const diagnosisCase = provider.getCase(session.caseId);
  const appliance = provider.getAppliance(session.applianceId);
  if (!diagnosisCase) return <CaseMissing title="Rapport" />;

  const lines = reportLines(diagnosisCase, session);
  const outcome = session.outcome;
  const safetyOutcome = outcome?.kind === 'safety';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        reportText({ appliance, diagnosisCase, session, sources: (id) => provider.getSource(id) }),
      );
      setCopied('done');
    } catch {
      setCopied('failed');
    }
    window.setTimeout(() => setCopied('idle'), 2500);
  };

  return (
    <Screen
      header={
        <AppHeader
          back={
            isFinished(session) && session.status === 'aborted'
              ? { href: `/toestellen/${session.applianceId}`, label: 'Naar toestel' }
              : { href: `/diagnose/${session.id}`, label: 'Terug naar diagnose' }
          }
          subtitle={appliance?.shortName}
          title="Rapport"
        />
      }
      footer={
        <div className="flex gap-3">
          <Button onClick={copy} className="flex-[2]">
            {copied === 'done' ? <Check aria-hidden size={20} /> : <Copy aria-hidden size={20} />}
            {copied === 'done' ? 'Gekopieerd' : copied === 'failed' ? 'Kopiëren mislukt' : 'Kopiëren'}
          </Button>
          <Button variant="secondary" onClick={() => window.print()} className="flex-1" aria-label="Afdrukken">
            <Printer aria-hidden size={20} />
            <span className="max-[22rem]:sr-only">Print</span>
          </Button>
        </div>
      }
    >
      <div className="flex items-center justify-between gap-3 pt-6">
        <SectionLabel>Servicerapport</SectionLabel>
        <StatusLabel tone={STATUS_TONE[session.status]}>{STATUS_LABEL[session.status]}</StatusLabel>
      </div>
      <h1 className="mt-2 text-question font-semibold">{appliance?.name ?? session.applianceId}</h1>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-body">
        <dt className="text-ink-3">Klacht</dt>
        <dd className="font-medium">{displayText(diagnosisCase.title)}</dd>
        <dt className="text-ink-3">Gestart</dt>
        <dd className="tabular font-medium">{formatDateTime(session.startedAt)}</dd>
      </dl>

      {outcome ? (
        <section
          className={
            safetyOutcome
              ? 'mt-6 rounded-md border-2 border-danger bg-danger-soft p-4'
              : 'mt-6 rounded-md border-2 border-ok/60 bg-ok-soft p-4'
          }
        >
          <SectionLabel className={safetyOutcome ? 'text-danger!' : 'text-ok!'}>
            {safetyOutcome ? 'Conclusie — veiligheidsstop' : 'Conclusie'}
          </SectionLabel>
          <p className="mt-1 text-title font-semibold">{displayText(outcome.cause)}</p>
          <p className="mt-3 text-label font-semibold uppercase tracking-label text-ink-3">Actie</p>
          <p className="text-body">{displayText(outcome.action)}</p>
          {!safetyOutcome ? (
            <>
              <p className="mt-3 text-label font-semibold uppercase tracking-label text-ink-3">Controle</p>
              <p className="text-body">{displayText(outcome.verification)}</p>
            </>
          ) : null}
          <div className="mt-3">
            <SourceReference sources={resolveSources(outcome.sourceIds)} />
          </div>
        </section>
      ) : (
        <p className="mt-6 rounded-md bg-warn-soft p-4 text-body font-medium text-warn">
          Geen conclusie: de diagnose is {session.status === 'aborted' ? 'gestopt' : 'nog niet afgerond'} bij stap{' '}
          {lines.filter((l) => l.kind !== 'safety-acknowledged').length + 1}.
        </p>
      )}

      <section className="mt-8">
        <SectionLabel>Doorlopen stappen</SectionLabel>
        {lines.length === 0 ? (
          <p className="mt-2 text-body text-ink-3">Nog geen stappen doorlopen.</p>
        ) : (
          <ol className="mt-2 divide-y divide-line border-y border-line">
            {lines.map((line, i) => {
              const safety = line.kind === 'safety-acknowledged';
              return (
                <li key={`${line.stepId}-${i}`} className={safety ? 'flex gap-3 bg-danger-soft px-2 py-3' : 'flex gap-3 py-3'}>
                  <span className="tabular w-6 shrink-0 text-small font-semibold text-ink-3">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className={safety ? 'text-small font-semibold text-danger' : 'text-small text-ink-2'}>{line.question}</p>
                    <p className="tabular mt-0.5 text-body font-semibold text-ink">{line.answer}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="mt-8 pb-6">
        <label htmlFor="notes" className="text-label font-semibold uppercase tracking-label text-ink-3">
          Notities
        </label>
        <textarea
          id="notes"
          defaultValue={session.notes}
          onBlur={(e) => {
            if (e.target.value !== session.notes) save(setNotes(session, e.target.value, new Date().toISOString()));
          }}
          rows={4}
          placeholder="Bevindingen, vervangen onderdelen, afspraken met klant"
          className="mt-2 w-full rounded-md border-2 border-line-strong bg-panel p-3 text-body text-ink outline-none placeholder:text-ink-3 focus:border-primary print:border-0 print:p-0"
        />
      </section>
    </Screen>
  );
}
