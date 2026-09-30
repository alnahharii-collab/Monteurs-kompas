import { FAULTS, getDevice, deviceName, type Terminal } from '../data/demo';
import { evaluate, pruneAnswers, type Answer, type ObservationValue } from './diagnosis';
import { formatNumber } from './measure';

export type ViewName =
  | 'start'
  | 'device'
  | 'fault'
  | 'diagnosis'
  | 'outcome'
  | 'report'
  | 'lookup'
  | 'more'
  | 'docs'
  | 'source';

export interface View {
  name: ViewName;
  sourceId?: string;
  anchor?: string;
}

export interface SafetyStop {
  summary: string;
  nextStep?: string;
  checkTitle: string;
  faultLabel: string;
  deviceLabel: string;
}

export interface Session {
  stack: View[];
  deviceId?: string;
  variantId?: string;
  /** Monteur bevestigt dat typeplaatje en bron overeenkomen. */
  variantConfirmed: boolean;
  faultCode?: string;
  answers: Answer[];
  /**
   * Nog niet verstuurde invoer voor de huidige controle. Blijft bewaard als de
   * monteur tussendoor een bron opent, en wordt gevuld bij "terug".
   */
  pending?: Pending;
  safetyStop?: SafetyStop;
  actionsDone: string;
  notice?: string;
  sourcesOpened: string[];
  lookupDeviceId?: string;
  lookupVariantId?: string;
}

export interface Pending {
  checkId: string;
  raw?: string;
  observation?: ObservationValue;
}

export type Action =
  | { type: 'navigate'; view: View }
  | { type: 'back' }
  | { type: 'home' }
  | { type: 'selectDevice'; deviceId: string }
  | { type: 'selectVariant'; variantId: string }
  | { type: 'confirmVariant'; confirmed: boolean }
  | { type: 'selectFault'; faultCode: string }
  | { type: 'answer'; answer: Answer }
  | { type: 'undoAnswer' }
  | { type: 'setPending'; pending: Pending }
  | { type: 'setActions'; text: string }
  | { type: 'sourceOpened'; sourceId: string }
  | { type: 'dismissNotice' }
  | { type: 'lookupDevice'; deviceId: string }
  | { type: 'lookupVariant'; variantId: string }
  | { type: 'newCase' };

export const initialSession: Session = {
  stack: [{ name: 'start' }],
  variantConfirmed: false,
  answers: [],
  actionsDone: '',
  sourcesOpened: [],
};

export function currentView(s: Session): View {
  return s.stack[s.stack.length - 1];
}

export function hasActiveCase(s: Session): boolean {
  return s.deviceId !== undefined;
}

/** Wist alles wat afhangt van toestel/uitvoering/storing. */
function clearFrom(s: Session, level: 'device' | 'variant' | 'fault'): Session {
  const hadDependents = s.answers.length > 0 || (level !== 'fault' && s.faultCode !== undefined);
  const next: Session = { ...s, answers: [], pending: undefined };
  if (level === 'device' || level === 'variant') {
    next.faultCode = undefined;
    next.variantConfirmed = false;
  }
  if (level === 'device') next.variantId = undefined;
  const what = level === 'fault' ? 'de storing' : level === 'variant' ? 'de uitvoering' : 'het toestel';
  next.notice = hadDependents
    ? `Je hebt ${what} gewijzigd. Eerdere controles en conclusies zijn gewist.`
    : undefined;
  return next;
}

function stopFor(s: Session, terminal: Terminal, checkTitle: string): SafetyStop {
  const device = getDevice(s.deviceId);
  return {
    summary: terminal.summary,
    nextStep: terminal.nextStep,
    checkTitle,
    faultLabel: s.faultCode ? FAULTS[s.faultCode]?.label ?? `Storing ${s.faultCode}` : '',
    deviceLabel: device ? deviceName(device) : '',
  };
}

export function reducer(s: Session, a: Action): Session {
  // Een actieve veiligheidsstop blokkeert alles wat de case zou wijzigen.
  // Alleen 'newCase' (expliciete, bevestigde reset) heft hem op.
  const locked = s.safetyStop !== undefined;

  switch (a.type) {
    case 'navigate':
      return { ...s, stack: [...s.stack, a.view] };
    case 'back':
      return s.stack.length > 1 ? { ...s, stack: s.stack.slice(0, -1) } : s;
    case 'home':
      return { ...s, stack: [{ name: 'start' }] };

    case 'selectDevice':
      if (locked || a.deviceId === s.deviceId) return s;
      return { ...clearFrom(s, 'device'), deviceId: a.deviceId };
    case 'selectVariant':
      if (locked || a.variantId === s.variantId) return s;
      return { ...clearFrom(s, 'variant'), variantId: a.variantId };
    case 'confirmVariant':
      if (locked) return s;
      if (!a.confirmed && s.variantConfirmed) {
        return { ...clearFrom(s, 'variant'), variantId: s.variantId, variantConfirmed: false };
      }
      return { ...s, variantConfirmed: a.confirmed };
    case 'selectFault':
      if (locked || a.faultCode === s.faultCode) return s;
      return { ...clearFrom(s, 'fault'), faultCode: a.faultCode };

    case 'answer': {
      if (locked) return s;
      const idx = s.answers.findIndex((x) => x.checkId === a.answer.checkId);
      const base = idx >= 0 ? s.answers.slice(0, idx) : s.answers;
      const answers = pruneAnswers(s.faultCode, [...base, a.answer]);
      const next: Session = { ...s, answers, pending: undefined, notice: undefined };
      const state = evaluate(s.faultCode, answers);
      if (state.status === 'end' && state.terminal.outcome === 'veiligheidsstop') {
        next.safetyStop = stopFor(s, state.terminal, state.lastCheck.title);
      }
      return next;
    }
    case 'undoAnswer': {
      if (locked || s.answers.length === 0) return s;
      const last = s.answers[s.answers.length - 1];
      const pending: Pending =
        last.kind === 'measurement'
          ? { checkId: last.checkId, raw: formatNumber(last.value) }
          : { checkId: last.checkId, observation: last.value };
      return { ...s, answers: s.answers.slice(0, -1), pending };
    }
    case 'setPending':
      return locked ? s : { ...s, pending: a.pending };

    case 'setActions':
      return { ...s, actionsDone: a.text };
    case 'sourceOpened':
      return s.sourcesOpened.includes(a.sourceId) ? s : { ...s, sourcesOpened: [...s.sourcesOpened, a.sourceId] };
    case 'dismissNotice':
      return { ...s, notice: undefined };

    case 'lookupDevice':
      return a.deviceId === s.lookupDeviceId ? s : { ...s, lookupDeviceId: a.deviceId, lookupVariantId: undefined };
    case 'lookupVariant':
      return { ...s, lookupVariantId: a.variantId };

    case 'newCase':
      return { ...initialSession };
  }
}
