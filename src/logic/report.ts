import { FAULTS, OUTCOME_LABEL, SOURCES, deviceName, getDevice } from '../data/demo';
import { evaluate } from './diagnosis';
import { formatNumber } from './measure';
import type { Session } from './session';

export interface ReportSection {
  title: string;
  lines: string[];
}

export interface Report {
  fictional: boolean;
  sections: ReportSection[];
}

const NONE = 'Niet geregistreerd';

const OBS_LABEL = { ja: 'Ja', nee: 'Nee', 'weet-niet': 'Weet ik niet' } as const;

/** Bouwt het rapport uitsluitend uit geregistreerde sessiegegevens. */
export function buildReport(s: Session): Report {
  const device = getDevice(s.deviceId);
  const variant = device?.variants.find((v) => v.id === s.variantId);
  const fault = s.faultCode ? FAULTS[s.faultCode] : undefined;
  const state = evaluate(s.faultCode, s.answers);

  const checks: string[] = [];
  const measurements: string[] = [];
  const findings: string[] = [];
  for (const answer of s.answers) {
    const check = fault?.checks[answer.checkId];
    if (!check) continue;
    if (answer.kind === 'observation' && check.kind === 'observation') {
      checks.push(`${check.title}: ${check.question} → ${OBS_LABEL[answer.value]}`);
    } else if (answer.kind === 'measurement' && check.kind === 'measurement') {
      checks.push(`${check.title}: gemeten`);
      measurements.push(`${check.label}: ${formatNumber(answer.value)} ${check.unit}`);
    }
  }

  let outcome = [NONE];
  const open: string[] = [];
  if (state.status === 'end') {
    outcome = [OUTCOME_LABEL[state.terminal.outcome]];
    findings.push(state.terminal.summary);
    if (state.terminal.nextStep) open.push(`Volgende stap: ${state.terminal.nextStep}`);
  } else if (state.status === 'check') {
    outcome = ['Diagnose niet afgerond'];
    open.push(`Nog uit te voeren: ${state.check.title}`);
  }
  if (s.safetyStop) {
    outcome = ['Veiligheidsstop'];
  }

  const src = device?.sourceId ? SOURCES[device.sourceId] : undefined;
  if (src && !src.contentReviewed) open.push('Bron is gekoppeld maar niet inhoudelijk gecontroleerd.');
  if (device && !s.variantConfirmed) open.push('Uitvoering niet bevestigd tegen de bron.');

  const actions = s.actionsDone.trim();

  return {
    fictional: device?.fictional ?? false,
    sections: [
      {
        title: 'Toestel',
        lines: device ? [`${deviceName(device)}${variant ? ` · ${variant.label}` : ''}`] : [NONE],
      },
      { title: 'Klacht / storingscode', lines: fault ? [fault.label] : [NONE] },
      { title: 'Uitgevoerde controles', lines: checks.length ? checks : [NONE] },
      { title: 'Meetwaarden', lines: measurements.length ? measurements : ['Geen meetwaarden ingevoerd'] },
      { title: 'Bevindingen', lines: findings.length ? findings : [NONE] },
      { title: 'Uitgevoerde handelingen', lines: actions ? actions.split('\n').filter(Boolean) : ['Geen handelingen geregistreerd'] },
      { title: 'Uitkomst', lines: outcome },
      { title: 'Openstaande punten', lines: open.length ? open : ['Geen'] },
    ],
  };
}

export function reportToText(r: Report): string {
  const head = ['SERVICERAPPORT — Monteur Kompas (oefendemo)'];
  if (r.fictional) head.push('LET OP: fictieve oefengegevens, niet voor praktijkgebruik.');
  const body = r.sections.map((sec) => `${sec.title.toUpperCase()}\n${sec.lines.map((l) => `- ${l}`).join('\n')}`);
  return [...head, '', ...body].join('\n\n').replace(/\n\n\n/g, '\n\n');
}
