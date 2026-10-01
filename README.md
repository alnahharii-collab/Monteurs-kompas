# Monteur Kompas

Digitaal gereedschap voor servicemonteurs: **probleem → diagnose → meting → actie → controle → rapport**.
MVP: *Storing oplossen* voor de Intergas Kombi Kompakt HRE 24/18 A. Productbrief: [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md).

## Starten

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Vitest: diagnose-engine, validatie, rapport, contentcontrole
npm run typecheck
npm run build        # draait eerst de contentcontrole en tests
npm run screenshots  # Playwright: flows + screenshots op 360/390/430/1024/1440 px → screenshots/
```

Playwright gebruikt een build met testfixtures (`NEXT_PUBLIC_TEST_FIXTURES=1`). Eigen Chromium:
`PLAYWRIGHT_CHROMIUM_PATH=/pad/naar/chromium npm run screenshots`.

## Inhoud aanleveren

Diagnosebomen: `content/diagnoses/*.json`. Het formaat staat in [`content/diagnoses/README.md`](content/diagnoses/README.md).
Fabrikantdocumenten: `content/docs/`. Zonder aangeleverde inhoud toont de app bij *Storing oplossen*
"Nog niet beschikbaar". Er wordt niets verzonnen.

`tests/fixtures/testcasus.case.json` is uitsluitend testinhoud voor unit- en screenshottests. Die zit nooit in een gewone build.

## Structuur

```
src/app/                 routes (/, /toestellen, /toestellen/[id], …/storing, /diagnose/[id], …/rapport)
src/components/ui/       design system (tokens in src/app/globals.css)
src/features/            appliances, search, diagnosis, measurements, sources, service-report
src/domain/              types + pure logica (diagnose-engine in src/domain/diagnosis)
src/data/                demodata; src/data/generated/ wordt gegenereerd uit content/
src/services/            servicegrens (DiagnosisProvider) voor latere AI/API
scripts/                 contentgenerator, icoonrenderer
```
