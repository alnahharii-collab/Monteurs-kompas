import type { SafetyFlag } from '../safety';
import type { Source } from '../sources';

export interface StepHelp {
  how?: string;
  why?: string;
}

export interface QuestionOption {
  label: string;
  next: string;
  safety?: SafetyFlag;
}

export interface MeasurementRange {
  min: number;
  max: number;
  sourceId: string;
}

/** Fysieke grenzen: waarden daarbuiten kunnen niet bestaan (geen technisch oordeel). */
export interface PhysicalLimits {
  min?: number;
  max?: number;
}

export interface QuestionStep {
  type: 'question';
  id: string;
  label?: string;
  prompt: string;
  instruction?: string;
  options: QuestionOption[];
  help?: StepHelp;
  sourceIds: string[];
}

export interface MeasurementStep {
  type: 'measurement';
  id: string;
  label?: string;
  prompt: string;
  instruction?: string;
  quantity: string;
  unit: string;
  range?: MeasurementRange;
  limits?: PhysicalLimits;
  next: { inRange: string; outOfRange: string; unknown: string };
  help?: StepHelp;
  sourceIds: string[];
}

export interface InstructionStep {
  type: 'instruction';
  id: string;
  label?: string;
  prompt: string;
  instruction?: string;
  next: string;
  help?: StepHelp;
  sourceIds: string[];
}

export interface OutcomeStep {
  type: 'outcome';
  id: string;
  cause: string;
  action: string;
  verification: string;
  sourceIds: string[];
}

export interface SafetyStopStep {
  type: 'safety-stop';
  id: string;
  category?: SafetyFlag['category'];
  reason: string;
  action: string;
  sourceIds: string[];
}

export type DiagnosisStep = QuestionStep | MeasurementStep | InstructionStep | OutcomeStep | SafetyStopStep;

export interface DiagnosisCase {
  id: string;
  applianceId: string;
  title: string;
  symptoms: string[];
  errorCodes: string[];
  startStepId: string;
  steps: Record<string, DiagnosisStep>;
}

/** Eén bestand in content/diagnoses/: een casus plus de bronnen waar het naar verwijst. */
export interface DiagnosisCaseFile {
  case: DiagnosisCase;
  sources: Source[];
}

/* ---------- Sessie ---------- */

export type MeasurementEvaluation = 'in-range' | 'out-of-range' | 'no-range' | 'not-measured';

export type PathEntry =
  | { kind: 'answer'; stepId: string; at: string; optionIndex: number; label: string }
  | {
      kind: 'measurement';
      stepId: string;
      at: string;
      value: number | null;
      unit: string;
      evaluation: MeasurementEvaluation;
    }
  | { kind: 'instruction-done'; stepId: string; at: string }
  | { kind: 'safety-acknowledged'; stepId: string; at: string; flag: SafetyFlag };

export type SessionStatus = 'active' | 'safety-stop' | 'completed' | 'aborted';

export interface PendingSafety {
  stepId: string;
  flag: SafetyFlag;
  /** Waar de flow heen gaat na bevestiging; null = flow eindigt. */
  next: string | null;
}

export interface SessionOutcome {
  stepId: string;
  kind: 'diagnosis' | 'safety';
  cause: string;
  action: string;
  verification?: string;
  sourceIds: string[];
}

export interface DiagnosisSession {
  schemaVersion: 1;
  id: string;
  applianceId: string;
  caseId: string;
  startedAt: string;
  updatedAt: string;
  status: SessionStatus;
  currentStepId: string;
  path: PathEntry[];
  pendingSafety: PendingSafety | null;
  outcome: SessionOutcome | null;
  /** Door de monteur uitgevoerde acties (vrije tekst, in volgorde). */
  actions: string[];
  notes: string;
}
