export type SafetyCategory = 'gas-leak' | 'flue-gas' | 'electrical' | 'unsafe-appliance';

export interface SafetyFlag {
  category: SafetyCategory;
  reason: string;
  action: string;
  sourceIds: string[];
}

export const SAFETY_CATEGORY_LABEL: Record<SafetyCategory, string> = {
  'gas-leak': 'Gaslekkage',
  'flue-gas': 'CO / rookgasafvoer',
  electrical: 'Elektrische onveiligheid',
  'unsafe-appliance': 'Onveilige toestelconditie',
};
