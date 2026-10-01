import { isTodo } from '../content';
import type { Source } from '../sources';
import type { DiagnosisCaseFile, DiagnosisStep } from './types';

export type IssueLevel = 'error' | 'todo' | 'warning';

export interface ValidationIssue {
  level: IssueLevel;
  where: string;
  message: string;
}

const STEP_TYPES: ReadonlySet<DiagnosisStep['type']> = new Set([
  'question',
  'measurement',
  'instruction',
  'outcome',
  'safety-stop',
]);

/**
 * Controleert een casusbestand uit content/diagnoses/.
 * - error: de flow kan breken of een bron is ongeldig → bestand wordt niet geladen
 * - todo: inhoud ontbreekt (gemarkeerd met TODO) → UI toont "Nog niet beschikbaar"
 * - warning: onbereikbare stappen e.d.
 */
export function validateCaseFile(file: DiagnosisCaseFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { case: c, sources } = file;
  const err = (where: string, message: string) => issues.push({ level: 'error', where, message });
  const todo = (where: string, message: string) => issues.push({ level: 'todo', where, message });
  const warn = (where: string, message: string) => issues.push({ level: 'warning', where, message });

  const sourceIds = new Set<string>();
  for (const source of sources) {
    if (sourceIds.has(source.id)) err(`bron ${source.id}`, 'Dubbele bron-id.');
    sourceIds.add(source.id);
    validateSource(source, err);
  }

  if (isTodo(c.id)) err('casus', 'Casus heeft geen id.');
  if (isTodo(c.applianceId)) err('casus', 'Casus heeft geen applianceId.');
  if (isTodo(c.title)) todo('casus', 'Titel ontbreekt.');
  if (c.symptoms.length === 0 && c.errorCodes.length === 0) {
    err('casus', 'Casus heeft geen symptomen en geen foutcodes; de monteur kan hem niet kiezen.');
  }

  const stepIds = new Set(Object.keys(c.steps));
  const checkTarget = (where: string, target: string) => {
    if (isTodo(target)) todo(where, 'Vervolgstap ontbreekt (TODO).');
    else if (!stepIds.has(target)) err(where, `Verwijst naar onbekende stap "${target}".`);
  };
  const checkSources = (where: string, ids: string[]) => {
    for (const id of ids) if (!sourceIds.has(id)) err(where, `Onbekende bron "${id}".`);
  };
  const checkText = (where: string, field: string, value: string | undefined, required: boolean) => {
    if (value === undefined && !required) return;
    if (isTodo(value)) todo(where, `${field} ontbreekt (TODO).`);
  };

  checkTarget('casus.startStepId', c.startStepId);

  for (const [key, step] of Object.entries(c.steps)) {
    const where = `stap ${key}`;
    if (!STEP_TYPES.has(step.type)) {
      err(where, `Onbekend staptype "${String((step as { type: unknown }).type)}".`);
      continue;
    }
    if (step.id !== key) err(where, `Stap-id "${step.id}" komt niet overeen met sleutel "${key}".`);
    checkSources(where, step.sourceIds);

    switch (step.type) {
      case 'question':
        checkText(where, 'Vraag', step.prompt, true);
        if (step.options.length < 2) err(where, 'Een vraag heeft minimaal twee antwoorden nodig.');
        step.options.forEach((option, i) => {
          const ow = `${where} antwoord ${i + 1}`;
          checkText(ow, 'Label', option.label, true);
          checkTarget(ow, option.next);
          if (option.safety) {
            checkText(ow, 'Veiligheidsreden', option.safety.reason, true);
            checkText(ow, 'Veiligheidsactie', option.safety.action, true);
            checkSources(ow, option.safety.sourceIds);
          }
        });
        break;
      case 'measurement':
        checkText(where, 'Vraag', step.prompt, true);
        if (isTodo(step.unit)) err(where, 'Meting zonder eenheid.');
        if (step.range) {
          if (!(step.range.min <= step.range.max)) err(where, 'Bereik: min is groter dan max.');
          if (!sourceIds.has(step.range.sourceId)) err(where, 'Bereik zonder geldige bron wordt niet getoond.');
        }
        checkTarget(`${where} (binnen bereik)`, step.next.inRange);
        checkTarget(`${where} (buiten bereik)`, step.next.outOfRange);
        checkTarget(`${where} (onbekend)`, step.next.unknown);
        break;
      case 'instruction':
        checkText(where, 'Instructie', step.prompt, true);
        checkTarget(where, step.next);
        break;
      case 'outcome':
        checkText(where, 'Oorzaak', step.cause, true);
        checkText(where, 'Actie', step.action, true);
        checkText(where, 'Controle', step.verification, true);
        break;
      case 'safety-stop':
        checkText(where, 'Veiligheidsreden', step.reason, true);
        checkText(where, 'Veiligheidsactie', step.action, true);
        break;
    }
  }

  for (const id of unreachableSteps(file)) warn(`stap ${id}`, 'Stap is vanaf de start niet bereikbaar.');
  return issues;
}

export function nextTargets(step: DiagnosisStep): string[] {
  switch (step.type) {
    case 'question':
      return step.options.map((o) => o.next);
    case 'measurement':
      return [step.next.inRange, step.next.outOfRange, step.next.unknown];
    case 'instruction':
      return [step.next];
    default:
      return [];
  }
}

function unreachableSteps({ case: c }: DiagnosisCaseFile): string[] {
  const seen = new Set<string>();
  const queue = [c.startStepId];
  while (queue.length > 0) {
    const id = queue.shift() as string;
    if (seen.has(id)) continue;
    const step = c.steps[id];
    if (!step) continue;
    seen.add(id);
    queue.push(...nextTargets(step));
  }
  return Object.keys(c.steps).filter((id) => !seen.has(id));
}

function validateSource(source: Source, err: (where: string, message: string) => void) {
  const where = `bron ${source.id}`;
  if (isTodo(source.title)) err(where, 'Bron zonder titel.');
  if (source.type === 'manufacturer') {
    if (!source.document) err(where, 'Fabrikantbron zonder document in content/docs/.');
    if (source.page === undefined || !Number.isInteger(source.page) || source.page < 1) {
      err(where, 'Fabrikantbron zonder gecontroleerd paginanummer.');
    }
  }
}
