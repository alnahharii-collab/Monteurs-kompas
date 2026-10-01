'use client';

import { useState } from 'react';
import { Disclosure } from '@/components/ui/Disclosure';
import { DiagnosisChoice } from '@/components/ui/DiagnosisChoice';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SourceReference, SourceTypeBadge } from '@/components/ui/SourceReference';
import { displayText } from '@/domain/content';
import type { InstructionStep, MeasurementStep, QuestionStep, StepHelp } from '@/domain/diagnosis/types';
import { resolveSources } from '@/features/sources/useSources';
import { Button } from '@/components/ui/Button';
import { MeasurementForm } from '@/features/measurements/MeasurementForm';

const DEFAULT_LABEL: Record<'question' | 'measurement' | 'instruction', string> = {
  question: 'Controle',
  measurement: 'Meting',
  instruction: 'Handeling',
};

type ActiveStep = QuestionStep | MeasurementStep | InstructionStep;

/** Eén beslissing per scherm. Hoe/Waarom/Bron standaard ingeklapt. */
export function DiagnosisStepView({
  step,
  onAnswer,
  onMeasure,
  onDone,
}: {
  step: ActiveStep;
  onAnswer: (optionIndex: number) => void;
  onMeasure: (value: number | null) => void;
  onDone: () => void;
}) {
  return (
    <div key={step.id} className="step-enter flex flex-1 flex-col">
      <SectionLabel tone="primary" className="pt-6">
        {step.label ?? DEFAULT_LABEL[step.type]}
      </SectionLabel>
      <h1 className="mt-2 text-question font-semibold text-ink">{displayText(step.prompt)}</h1>
      {step.instruction ? <p className="mt-2 line-clamp-2 text-body text-ink-2">{displayText(step.instruction)}</p> : null}

      <StepDetails help={step.help} sourceIds={step.sourceIds} instruction={step.instruction} />

      <div className="mt-auto pt-6 pb-4">
        {step.type === 'question' ? <QuestionAnswers step={step} onAnswer={onAnswer} /> : null}
        {step.type === 'measurement' ? <MeasurementForm step={step} onSubmit={onMeasure} /> : null}
        {step.type === 'instruction' ? <Button onClick={onDone}>Gedaan</Button> : null}
      </div>
    </div>
  );
}

function QuestionAnswers({ step, onAnswer }: { step: QuestionStep; onAnswer: (i: number) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div role="radiogroup" aria-label="Antwoord" className="flex flex-col gap-3">
      {step.options.map((option, i) => (
        <DiagnosisChoice
          key={`${step.id}-${i}`}
          label={displayText(option.label)}
          selected={picked === i}
          disabled={picked !== null && picked !== i}
          onSelect={() => {
            if (picked !== null) return;
            setPicked(i);
            window.setTimeout(() => onAnswer(i), 160);
          }}
        />
      ))}
    </div>
  );
}

function StepDetails({ help, sourceIds, instruction }: { help?: StepHelp; sourceIds: string[]; instruction?: string }) {
  const sources = resolveSources(sourceIds);
  const firstType = sources.find((s) => s !== null)?.type ?? null;
  return (
    <div className="mt-6 border-b border-line">
      {instruction && instruction.length > 110 ? (
        <Disclosure title="Volledige instructie">{displayText(instruction)}</Disclosure>
      ) : null}
      {help?.how !== undefined ? <Disclosure title="Hoe controleer ik dit">{displayText(help.how)}</Disclosure> : null}
      {help?.why !== undefined ? <Disclosure title="Waarom">{displayText(help.why)}</Disclosure> : null}
      <Disclosure title="Bron" aside={<SourceTypeBadge type={firstType} />}>
        <SourceReference sources={sources} />
      </Disclosure>
    </div>
  );
}
