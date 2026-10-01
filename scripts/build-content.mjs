// Zet content/diagnoses/*.json om naar src/data/generated/cases.ts.
// Met NEXT_PUBLIC_TEST_FIXTURES=1 worden ook tests/fixtures/*.case.json meegenomen
// (alleen voor tests en screenshots, nooit in productie).
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;

function readDir(dir, filter) {
  let names = [];
  try {
    names = readdirSync(join(root, dir));
  } catch {
    return [];
  }
  return names
    .filter(filter)
    .sort()
    .map((name) => {
      const path = join(dir, name);
      try {
        return { path, data: JSON.parse(readFileSync(join(root, path), 'utf8')) };
      } catch (error) {
        console.error(`✗ ${path}: geen geldige JSON (${error.message})`);
        process.exit(1);
      }
    });
}

const content = readDir('content/diagnoses', (n) => n.endsWith('.json') && !n.startsWith('_'));
const fixtures =
  process.env.NEXT_PUBLIC_TEST_FIXTURES === '1' ? readDir('tests/fixtures', (n) => n.endsWith('.case.json')) : [];

const out = join(root, 'src/data/generated');
mkdirSync(out, { recursive: true });
const body = (files) => JSON.stringify(files.map((f) => f.data), null, 2);
writeFileSync(
  join(out, 'cases.ts'),
  `// Gegenereerd door scripts/build-content.mjs — niet handmatig bewerken.
import type { DiagnosisCaseFile } from '@/domain/diagnosis/types';

export const contentCaseFiles: DiagnosisCaseFile[] = ${body(content)};

export const fixtureCaseFiles: DiagnosisCaseFile[] = ${body(fixtures)};
`,
);
console.log(`content: ${content.length} casus(sen) uit content/diagnoses, ${fixtures.length} testfixture(s)`);
