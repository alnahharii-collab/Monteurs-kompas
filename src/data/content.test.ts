/**
 * Contentcontrole: draait in `npm test` en vóór `npm run build`.
 * Een casus met fouten breekt de build; TODO's worden gemeld.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateCaseFile } from '@/domain/diagnosis/validate';
import { appliances } from './appliances';
import { contentCaseFiles } from './generated/cases';

const docsDir = join(process.cwd(), 'content/docs');

describe('content/diagnoses', () => {
  it.each(contentCaseFiles.map((f) => [f.case.id, f] as const))('%s is geldig', (_id, file) => {
    const issues = validateCaseFile(file);
    for (const todo of issues.filter((i) => i.level !== 'error')) {
      console.warn(`[${file.case.id}] ${todo.level.toUpperCase()} ${todo.where}: ${todo.message}`);
    }
    expect(issues.filter((i) => i.level === 'error')).toEqual([]);
    expect(appliances.map((a) => a.id)).toContain(file.case.applianceId);
    for (const source of file.sources) {
      if (source.type === 'manufacturer' && source.document) {
        expect(existsSync(join(docsDir, source.document)), `${source.document} staat niet in content/docs/`).toBe(true);
      }
    }
  });

  it('casus-id’s zijn uniek', () => {
    const ids = contentCaseFiles.map((f) => f.case.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
