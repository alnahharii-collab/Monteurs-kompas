import type { Appliance } from '@/domain/appliance';
import { displayText } from '@/domain/content';
import { formatNumber } from '@/domain/diagnosis/measurement';
import type { DiagnosisCase, DiagnosisSession, MeasurementEvaluation, PathEntry } from '@/domain/diagnosis/types';
import { SAFETY_CATEGORY_LABEL } from '@/domain/safety';
import { SOURCE_MISSING_LABEL, SOURCE_TYPE_LABEL, type Source } from '@/domain/sources';

export const EVALUATION_LABEL: Record<MeasurementEvaluation, string> = {
  'in-range': 'Binnen bereik',
  'out-of-range': 'Buiten bereik',
  'no-range': 'Geen bereik bekend',
  'not-measured': 'Niet gemeten',
};

export const STATUS_LABEL: Record<DiagnosisSession['status'], string> = {
  active: 'Diagnose loopt',
  'safety-stop': 'Veiligheidsstop open',
  completed: 'Afgerond',
  aborted: 'Gestopt',
};

export interface ReportLine {
  stepId: string;
  question: string;
  answer: string;
  kind: PathEntry['kind'];
  at: string;
  evaluation?: MeasurementEvaluation;
}

export function stepPrompt(diagnosisCase: DiagnosisCase, stepId: string): string {
  const step = diagnosisCase.steps[stepId];
  if (!step) return displayText(null);
  switch (step.type) {
    case 'outcome':
      return displayText(step.cause);
    case 'safety-stop':
      return displayText(step.reason);
    default:
      return displayText(step.prompt);
  }
}

export function reportLines(diagnosisCase: DiagnosisCase, session: DiagnosisSession): ReportLine[] {
  return session.path.map((entry) => {
    const base = { stepId: entry.stepId, kind: entry.kind, at: entry.at, question: stepPrompt(diagnosisCase, entry.stepId) };
    switch (entry.kind) {
      case 'answer':
        return { ...base, answer: entry.label };
      case 'measurement':
        return {
          ...base,
          evaluation: entry.evaluation,
          answer:
            entry.value === null
              ? EVALUATION_LABEL['not-measured']
              : `${formatNumber(entry.value)} ${entry.unit}${
                  entry.evaluation === 'in-range' || entry.evaluation === 'out-of-range'
                    ? ` (${EVALUATION_LABEL[entry.evaluation].toLowerCase()})`
                    : ''
                }`,
        };
      case 'instruction-done':
        return { ...base, answer: 'Uitgevoerd' };
      case 'safety-acknowledged':
        return {
          ...base,
          question: `VEILIGHEIDSSTOP — ${SAFETY_CATEGORY_LABEL[entry.flag.category]}: ${displayText(entry.flag.reason)}`,
          answer: `Bevestigd: ${displayText(entry.flag.action)}`,
        };
    }
  });
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('nl-NL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export function formatSource(source: Source | null): string {
  if (!source) return SOURCE_MISSING_LABEL;
  const where = [source.document, source.page ? `p. ${source.page}` : null].filter(Boolean).join(', ');
  return `${SOURCE_TYPE_LABEL[source.type]}: ${source.title}${where ? ` (${where})` : ''}`;
}

/** Platte tekst voor kopiëren naar werkbon of e-mail. */
export function reportText(params: {
  appliance: Appliance | null;
  diagnosisCase: DiagnosisCase;
  session: DiagnosisSession;
  sources: (id: string) => Source | null;
}): string {
  const { appliance, diagnosisCase, session, sources } = params;
  const out: string[] = [];
  out.push('SERVICERAPPORT — Monteur Kompas');
  out.push(`Toestel: ${appliance?.name ?? session.applianceId}`);
  out.push(`Klacht: ${displayText(diagnosisCase.title)}`);
  out.push(`Gestart: ${formatDateTime(session.startedAt)}`);
  out.push(`Status: ${STATUS_LABEL[session.status]}`);
  out.push('');
  if (session.outcome) {
    out.push(session.outcome.kind === 'safety' ? 'CONCLUSIE — VEILIGHEIDSSTOP' : 'CONCLUSIE');
    out.push(`Oorzaak: ${displayText(session.outcome.cause)}`);
    out.push(`Actie: ${displayText(session.outcome.action)}`);
    if (session.outcome.kind === 'diagnosis') out.push(`Controle: ${displayText(session.outcome.verification)}`);
    const ids = session.outcome.sourceIds;
    out.push(`Bron: ${ids.length ? ids.map((id) => formatSource(sources(id))).join('; ') : SOURCE_MISSING_LABEL}`);
    out.push('');
  }
  out.push('DOORLOPEN STAPPEN');
  const lines = reportLines(diagnosisCase, session);
  if (lines.length === 0) out.push('—');
  lines.forEach((line, i) => out.push(`${i + 1}. ${line.question} → ${line.answer}`));
  if (session.actions.length) {
    out.push('', 'UITGEVOERDE ACTIES', ...session.actions.map((a) => `- ${a}`));
  }
  if (session.notes.trim()) {
    out.push('', 'NOTITIES', session.notes.trim());
  }
  return out.join('\n');
}
