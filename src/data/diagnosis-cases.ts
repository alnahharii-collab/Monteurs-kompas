import { validateCaseFile } from '@/domain/diagnosis/validate';
import type { DiagnosisCase, DiagnosisCaseFile } from '@/domain/diagnosis/types';
import type { Source } from '@/domain/sources';
import { contentCaseFiles, fixtureCaseFiles } from './generated/cases';

/** Casussen met fouten worden niet geladen; `npm run build` faalt daar al op via de contenttest. */
function loadable(files: DiagnosisCaseFile[]): DiagnosisCaseFile[] {
  return files.filter((file) => validateCaseFile(file).every((issue) => issue.level !== 'error'));
}

const files = loadable([...contentCaseFiles, ...fixtureCaseFiles]);

export const diagnosisCases: DiagnosisCase[] = files.map((f) => f.case);

export const sourcesById: ReadonlyMap<string, Source> = new Map(
  files.flatMap((f) => f.sources.map((s) => [s.id, s] as const)),
);
