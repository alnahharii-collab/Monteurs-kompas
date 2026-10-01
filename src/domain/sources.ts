export type SourceType = 'manufacturer' | 'standard' | 'field' | 'general';

export interface Source {
  id: string;
  type: SourceType;
  title: string;
  /** Bestandsnaam in content/docs/ (verplicht bij type 'manufacturer'). */
  document?: string;
  /** Zelf gecontroleerd paginanummer (verplicht bij type 'manufacturer'). */
  page?: number;
  note?: string;
}

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  manufacturer: 'Fabrikant',
  standard: 'Norm/regelgeving',
  field: 'Praktijkkennis',
  general: 'Algemeen advies',
};

export const SOURCE_MISSING_LABEL = 'Bron niet beschikbaar';
