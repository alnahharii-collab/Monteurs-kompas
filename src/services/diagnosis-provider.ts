/**
 * Servicegrens tussen UI en inhoud. Nu lokaal en deterministisch (data uit content/diagnoses/).
 * Een latere AI- of API-implementatie voldoet aan hetzelfde contract; de UI hoeft dan niet te veranderen.
 */
import type { Appliance } from '@/domain/appliance';
import type { DiagnosisCase } from '@/domain/diagnosis/types';
import type { Source } from '@/domain/sources';
import { appliances } from '@/data/appliances';
import { diagnosisCases, sourcesById } from '@/data/diagnosis-cases';
import { normalize, searchAppliances } from '@/features/search/search';

export interface DiagnosisProvider {
  listAppliances(): Appliance[];
  getAppliance(id: string): Appliance | null;
  searchAppliances(query: string): Appliance[];
  listCases(applianceId: string): DiagnosisCase[];
  getCase(caseId: string): DiagnosisCase | null;
  findCasesByErrorCode(applianceId: string, code: string): DiagnosisCase[];
  getSource(id: string): Source | null;
}

export const localProvider: DiagnosisProvider = {
  listAppliances: () => appliances,
  getAppliance: (id) => appliances.find((a) => a.id === id) ?? null,
  searchAppliances: (query) => searchAppliances(appliances, query),
  listCases: (applianceId) => diagnosisCases.filter((c) => c.applianceId === applianceId),
  getCase: (caseId) => diagnosisCases.find((c) => c.id === caseId) ?? null,
  findCasesByErrorCode: (applianceId, code) => {
    const wanted = normalize(code);
    if (!wanted) return [];
    return diagnosisCases.filter(
      (c) => c.applianceId === applianceId && c.errorCodes.some((e) => normalize(e) === wanted),
    );
  },
  getSource: (id) => sourcesById.get(id) ?? null,
};

export const provider: DiagnosisProvider = localProvider;
