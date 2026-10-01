/**
 * Demo-data voor Monteur Kompas.
 *
 * ALLE toestellen, storingen, controles, grenswaarden en bronnen hieronder zijn
 * FICTIEVE OEFENDATA. Ze zijn niet afkomstig van een echte fabrikant en mogen
 * niet in de praktijk worden gebruikt. Velden die niet zijn vastgelegd blijven
 * bewust leeg (undefined) en worden dan niet getoond.
 */

export type SourceKind = 'fabrikant' | 'norm' | 'algemeen' | 'praktijk';

export const SOURCE_KIND_LABEL: Record<SourceKind, string> = {
  fabrikant: 'Fabrikantvoorschrift',
  norm: 'Wet / norm',
  algemeen: 'Algemeen technisch advies',
  praktijk: 'Praktijkervaring',
};

export interface SourceDoc {
  id: string;
  kind: SourceKind;
  manufacturer?: string;
  device?: string;
  title?: string;
  docNumber?: string;
  version?: string;
  page?: string;
  /** Of de inhoud door een mens inhoudelijk is gecontroleerd. */
  contentReviewed: boolean;
  /** false = het document is gekoppeld maar kan niet worden geopend. */
  available: boolean;
  fictional: boolean;
  /** Relevante passages per anker (controle-id of 'handleiding'). */
  passages: Record<string, string>;
}

export interface Variant {
  id: string;
  label: string;
  /** Of de bron op deze uitvoering van toepassing is. */
  coveredBySource: boolean;
}

export interface Device {
  id: string;
  brand: string;
  type: string;
  fictional: boolean;
  variants: Variant[];
  sourceId?: string;
  faultCodes: string[];
}

export type Outcome =
  | 'bevestigd'
  | 'mogelijk'
  | 'meer-onderzoek'
  | 'onvoldoende'
  | 'veiligheidsstop';

export const OUTCOME_LABEL: Record<Outcome, string> = {
  bevestigd: 'Oorzaak bevestigd',
  mogelijk: 'Mogelijke oorzaak',
  'meer-onderzoek': 'Meer onderzoek nodig',
  onvoldoende: 'Onvoldoende informatie',
  veiligheidsstop: 'Veiligheidsstop',
};

export interface Terminal {
  outcome: Outcome;
  summary: string;
  /** Alleen invullen als de volgende stap onderbouwd is. */
  nextStep?: string;
}

export type Next = { check: string } | { end: Terminal };

interface CheckBase {
  id: string;
  title: string;
  instruction: string;
  /** Essentiële veiligheidsinformatie: wordt altijd zichtbaar getoond. */
  safety?: string;
  /** Aanvullende uitleg achter "Waarom deze controle?". */
  why?: string;
  sourceId?: string;
  sourceKind: SourceKind;
}

export interface ObservationCheck extends CheckBase {
  kind: 'observation';
  question: string;
  onYes: Next;
  onNo: Next;
  onUnknown: Next;
}

export interface MeasurementCheck extends CheckBase {
  kind: 'measurement';
  label: string;
  unit: string;
  /** Oefengrens; inclusief. Ontbreekt een grens, dan geldt die zijde niet. */
  min?: number;
  max?: number;
  inRange: Next;
  outOfRange: Next;
}

export type Check = ObservationCheck | MeasurementCheck;

export interface Fault {
  code: string;
  label: string;
  /** Alleen gevuld wanneer de omschrijving uit de gekoppelde bron komt. */
  description?: string;
  rootCheck: string;
  checks: Record<string, Check>;
}

export const SOURCES: Record<string, SourceDoc> = {
  'oef-0001': {
    id: 'oef-0001',
    kind: 'fabrikant',
    manufacturer: 'Oefenmerk (fictief)',
    device: 'CV-24, uitvoering A',
    title: 'Oefenhandleiding CV-24 (fictief)',
    docNumber: 'OEF-0001',
    // Versie en pagina zijn niet vastgelegd en worden daarom niet getoond.
    contentReviewed: false,
    available: true,
    fictional: true,
    passages: {
      handleiding:
        'Fictieve oefentekst. Deze oefenhandleiding beschrijft uitsluitend de oefencases Storing 4 en Storing 5 voor uitvoering A.',
      'f4-lampje':
        'Fictieve oefentekst. Controleer of het controlelampje van onderdeel A brandt wanneer het toestel een warmtevraag heeft.',
      'f4-spanning':
        'Fictieve oefentekst. De spanning op aansluiting A1 moet tussen 20,0 en 30,0 V liggen (oefengrens).',
      'f5-kabel':
        'Fictieve oefentekst. Controleer kabel K1 visueel op beschadiging voordat je gaat meten.',
      'f5-weerstand':
        'Fictieve oefentekst. De weerstand van kabel K1 mag maximaal 1,0 Ω zijn (oefengrens).',
    },
  },
  'oef-0002': {
    id: 'oef-0002',
    kind: 'fabrikant',
    manufacturer: 'Oefenmerk (fictief)',
    device: 'CV-30',
    docNumber: 'OEF-0002',
    contentReviewed: false,
    available: false,
    fictional: true,
    passages: {},
  },
  algemeen: {
    id: 'algemeen',
    kind: 'algemeen',
    title: 'Algemene veiligheidsregel gaslucht',
    contentReviewed: false,
    available: true,
    fictional: false,
    passages: {
      'f4-gas':
        'Algemeen veiligheidsadvies, geen fabrikantvoorschrift: bij gaslucht niet verder werken aan het toestel en de procedure van je werkgever volgen.',
    },
  },
};

export const DEVICES: Device[] = [
  {
    id: 'cv24',
    brand: 'Oefenmerk',
    type: 'CV-24',
    fictional: true,
    variants: [
      { id: 'A', label: 'Uitvoering A', coveredBySource: true },
      { id: 'B', label: 'Uitvoering B', coveredBySource: false },
    ],
    sourceId: 'oef-0001',
    faultCodes: ['4', '5'],
  },
  {
    id: 'cv30',
    brand: 'Oefenmerk',
    type: 'CV-30',
    fictional: true,
    variants: [],
    sourceId: 'oef-0002',
    faultCodes: [],
  },
];

export const FAULTS: Record<string, Fault> = {
  '4': {
    code: '4',
    label: 'Storing 4',
    description: 'Oefencase: toestel reageert niet op warmtevraag (fictief)',
    rootCheck: 'f4-gas',
    checks: {
      'f4-gas': {
        id: 'f4-gas',
        kind: 'observation',
        title: 'Gaslucht',
        instruction: 'Ruik bij het toestel en de gasleiding.',
        question: 'Ruik je gas?',
        safety: 'Ruik je gas? Werk dan niet verder aan het toestel.',
        sourceId: 'algemeen',
        sourceKind: 'algemeen',
        onYes: {
          end: {
            outcome: 'veiligheidsstop',
            summary: 'Gaslucht waargenomen bij het toestel.',
            nextStep: 'Werk niet verder. Volg de gasprocedure van je werkgever.',
          },
        },
        onNo: { check: 'f4-lampje' },
        onUnknown: {
          end: {
            outcome: 'onvoldoende',
            summary: 'Niet vastgesteld of er gaslucht is.',
            nextStep: 'Stel eerst vast of er gaslucht is, voordat je verdergaat.',
          },
        },
      },
      'f4-lampje': {
        id: 'f4-lampje',
        kind: 'observation',
        title: 'Controlelampje onderdeel A',
        instruction: 'Geef een warmtevraag en kijk naar het controlelampje van onderdeel A.',
        question: 'Brandt het controlelampje?',
        why: 'Het lampje laat zien of onderdeel A een signaal krijgt. Zo weet je of je verder moet zoeken in de voeding of in onderdeel A zelf.',
        sourceId: 'oef-0001',
        sourceKind: 'fabrikant',
        onYes: { check: 'f4-spanning' },
        onNo: {
          end: {
            outcome: 'mogelijk',
            summary: 'Het controlelampje van onderdeel A brandt niet bij warmtevraag.',
            nextStep: 'Onderzoek de aansturing van onderdeel A verder. Deze oefencase gaat hier niet verder.',
          },
        },
        onUnknown: {
          end: {
            outcome: 'onvoldoende',
            summary: 'Niet vastgesteld of het controlelampje brandt.',
          },
        },
      },
      'f4-spanning': {
        id: 'f4-spanning',
        kind: 'measurement',
        title: 'Spanning aansluiting A1',
        instruction: 'Meet de spanning op aansluiting A1 tijdens warmtevraag.',
        safety: 'Je meet aan spanningvoerende delen. Gebruik geschikt meetgereedschap.',
        label: 'Gemeten spanning',
        unit: 'V',
        min: 20,
        max: 30,
        sourceId: 'oef-0001',
        sourceKind: 'fabrikant',
        inRange: {
          end: {
            outcome: 'meer-onderzoek',
            summary: 'De spanning op A1 ligt binnen de oefengrens. De oorzaak zit niet in de voeding van A1.',
          },
        },
        outOfRange: {
          end: {
            outcome: 'mogelijk',
            summary: 'De spanning op A1 ligt buiten de oefengrens.',
            nextStep: 'Onderzoek de voeding naar aansluiting A1.',
          },
        },
      },
    },
  },
  '5': {
    code: '5',
    label: 'Storing 5',
    description: 'Oefencase: onderbreking in kabel K1 (fictief)',
    rootCheck: 'f5-kabel',
    checks: {
      'f5-kabel': {
        id: 'f5-kabel',
        kind: 'observation',
        title: 'Kabel K1 bekijken',
        instruction: 'Maak het toestel spanningsloos en bekijk kabel K1 over de hele lengte.',
        question: 'Zie je schade aan kabel K1?',
        safety: 'Maak het toestel eerst spanningsloos.',
        sourceId: 'oef-0001',
        sourceKind: 'fabrikant',
        onYes: {
          end: {
            outcome: 'veiligheidsstop',
            summary: 'Zichtbare schade aan kabel K1.',
            nextStep: 'Zet het toestel niet onder spanning. Vervang eerst de beschadigde kabel.',
          },
        },
        onNo: { check: 'f5-weerstand' },
        onUnknown: {
          end: {
            outcome: 'onvoldoende',
            summary: 'Kabel K1 kon niet worden bekeken.',
          },
        },
      },
      'f5-weerstand': {
        id: 'f5-weerstand',
        kind: 'measurement',
        title: 'Weerstand kabel K1',
        instruction: 'Meet de weerstand van kabel K1, met het toestel spanningsloos.',
        safety: 'Meet alleen met het toestel spanningsloos.',
        why: 'Een te hoge weerstand wijst op een onderbreking in de kabel.',
        label: 'Gemeten weerstand',
        unit: 'Ω',
        max: 1,
        sourceId: 'oef-0001',
        sourceKind: 'fabrikant',
        inRange: {
          end: {
            outcome: 'meer-onderzoek',
            summary: 'De weerstand van K1 ligt binnen de oefengrens. De kabel is niet de oorzaak.',
          },
        },
        outOfRange: {
          end: {
            outcome: 'bevestigd',
            summary: 'De weerstand van K1 ligt boven de oefengrens: onderbreking in kabel K1.',
            nextStep: 'Vervang kabel K1 en controleer daarna de werking.',
          },
        },
      },
    },
  },
};

export function getDevice(id: string | undefined): Device | undefined {
  return DEVICES.find((d) => d.id === id);
}

export function deviceName(d: Device): string {
  return `${d.brand} ${d.type}`;
}
