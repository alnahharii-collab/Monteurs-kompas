'use client';

import { CircleHelp, FileClock, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { DiagnosisChoice } from '@/components/ui/DiagnosisChoice';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { UNAVAILABLE_LABEL } from '@/domain/content';
import type { DiagnosisCase } from '@/domain/diagnosis/types';
import { provider } from '@/services/diagnosis-provider';
import { startDiagnosis } from './start';

type Mode = 'code' | 'symptom';

export function ComplaintPicker({ applianceId }: { applianceId: string }) {
  const appliance = provider.getAppliance(applianceId);
  const cases = useMemo(() => provider.listCases(applianceId), [applianceId]);
  const hasCodes = cases.some((c) => c.errorCodes.length > 0);
  const hasSymptoms = cases.some((c) => c.symptoms.length > 0);
  const [mode, setMode] = useState<Mode>(hasCodes ? 'code' : 'symptom');
  const [startError, setStartError] = useState(false);
  const router = useRouter();

  const start = (diagnosisCase: DiagnosisCase) => {
    const href = startDiagnosis(diagnosisCase);
    if (href) router.push(href);
    else setStartError(true);
  };

  const header = (
    <AppHeader
      back={{ href: `/toestellen/${applianceId}`, label: 'Terug naar toestel' }}
      subtitle={appliance?.shortName}
      title="Storing oplossen"
    />
  );

  if (cases.length === 0) {
    return (
      <Screen header={header}>
        <h1 className="pt-6 text-question font-semibold">Wat is de klacht?</h1>
        <EmptyState icon={<FileClock size={24} />} title={UNAVAILABLE_LABEL} tone="warn">
          <p>Voor dit toestel zijn nog geen diagnosebomen aangeleverd.</p>
          <p className="mt-2">Zodra ze in Monteur Kompas staan, kies je hier een foutcode of symptoom.</p>
        </EmptyState>
      </Screen>
    );
  }

  return (
    <Screen header={header}>
      <h1 className="pt-6 pb-4 text-question font-semibold">Wat is de klacht?</h1>
      {hasCodes && hasSymptoms ? (
        <SegmentedControl<Mode>
          label="Zoeken op"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'code', label: 'Foutcode' },
            { value: 'symptom', label: 'Symptoom' },
          ]}
        />
      ) : null}

      {startError ? (
        <p role="alert" className="mt-4 rounded-md bg-warn-soft p-3 text-small font-semibold text-warn">
          De diagnose kon niet worden opgeslagen op dit apparaat. Controleer of opslag voor deze site is toegestaan.
        </p>
      ) : null}

      <div className="flex flex-1 flex-col pt-6 pb-6">
        {mode === 'code' ? (
          <ErrorCodeSearch applianceId={applianceId} onStart={start} onShowSymptoms={hasSymptoms ? () => setMode('symptom') : undefined} />
        ) : (
          <SymptomList cases={cases} onStart={start} />
        )}
      </div>
    </Screen>
  );
}

function ErrorCodeSearch({
  applianceId,
  onStart,
  onShowSymptoms,
}: {
  applianceId: string;
  onStart: (c: DiagnosisCase) => void;
  onShowSymptoms?: () => void;
}) {
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const matches = submitted ? provider.findCasesByErrorCode(applianceId, submitted) : [];

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) setSubmitted(code.trim());
        }}
      >
        <label htmlFor="code" className="text-label font-semibold uppercase tracking-label text-ink-3">
          Foutcode op display
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setSubmitted(null);
            }}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            placeholder="Code"
            className="tabular h-choice min-w-0 flex-1 rounded-md border-2 border-line-strong bg-panel px-4 font-mono text-title font-semibold tracking-wider text-ink outline-none placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-3 focus:border-primary"
          />
          <Button type="submit" className="w-auto! px-6" disabled={!code.trim()}>
            Zoek
          </Button>
        </div>
      </form>

      {submitted && matches.length === 0 ? (
        <EmptyState
          icon={<Hash size={24} />}
          title={`Onbekende foutcode “${submitted}”`}
          tone="warn"
          action={
            onShowSymptoms ? (
              <Button variant="secondary" onClick={onShowSymptoms}>
                Kies op symptoom
              </Button>
            ) : undefined
          }
        >
          Voor deze code is geen diagnose beschikbaar. Controleer de code op het display.
        </EmptyState>
      ) : null}

      {matches.length > 0 ? (
        <section className="mt-6" aria-label="Gevonden diagnoses">
          <SectionLabel className="mb-2">Code {submitted}</SectionLabel>
          <div className="flex flex-col gap-3">
            {matches.map((c) => (
              <div key={c.id} className="flex flex-col gap-3">
                <p className="text-title font-semibold">{c.title}</p>
                <Button onClick={() => onStart(c)}>Start diagnose</Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function SymptomList({ cases, onStart }: { cases: DiagnosisCase[]; onStart: (c: DiagnosisCase) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const items = cases.flatMap((c) => c.symptoms.map((symptom) => ({ key: `${c.id}:${symptom}`, symptom, diagnosisCase: c })));

  if (items.length === 0) {
    return (
      <EmptyState icon={<CircleHelp size={24} />} title={UNAVAILABLE_LABEL} tone="warn">
        Voor dit toestel zijn nog geen symptomen aangeleverd.
      </EmptyState>
    );
  }

  return (
    <div role="radiogroup" aria-label="Symptoom" className="mt-auto flex flex-col gap-3">
      <SectionLabel>Kies wat je ziet</SectionLabel>
      {items.map((item) => (
        <DiagnosisChoice
          key={item.key}
          label={item.symptom}
          selected={picked === item.key}
          disabled={picked !== null && picked !== item.key}
          onSelect={() => {
            if (picked) return;
            setPicked(item.key);
            window.setTimeout(() => onStart(item.diagnosisCase), 160);
          }}
        />
      ))}
    </div>
  );
}
