# Monteur Kompas — Productbrief

> Vaste context voor elke taak. Lees dit volledig voordat je iets bouwt.
> Fase-opdrachten staan in `docs/fases.md`. Diagnose-inhoud staat in `content/diagnoses/`.

## 1. Wat het is

Digitaal gereedschap voor Nederlandse service- en onderhoudsmonteurs. De app leidt de monteur van **probleem → diagnose → meting → actie → controle → rapport**.

De eerste versie doet één ding uitzonderlijk goed: **Storing oplossen**, voor één demo-toestel: **Intergas Kombi Kompakt HRE 24/18 A**.

**De maatstaf:** kan een servicemonteur de app zonder uitleg openen en daarmee sneller en betrouwbaarder een storing vinden?

## 2. De gebruiker

De monteur werkt onder tijdsdruk bij de klant, in krappe technische ruimtes, met slechte verbinding, vieze handen of handschoenen, vaak met één hand, in fel licht of juist in het donker.

Stel bij elke beslissing de vraag: **helpt dit de monteur sneller en betrouwbaarder van probleem naar oplossing?** Is het antwoord nee, dan bouw je het niet.

## 3. Vaste beslissingen (niet heroverwegen)

| Onderwerp | Beslissing |
|---|---|
| Stack | Next.js (App Router), React, TypeScript strict (geen `any`), Tailwind CSS |
| UI-taal | Nederlands |
| AI | **De MVP bevat geen LLM-calls.** Diagnose is deterministisch en komt uit data. Maak wel een duidelijke servicegrens (`services/`), zodat AI later kan worden toegevoegd. |
| Data | Getypeerde TS-/JSON-bestanden in `src/data`. Geen database, geen backend, geen auth. |
| Persistentie | Een lopende diagnosesessie staat in localStorage, zodat hervatten werkt. |
| PWA | Manifest en icons ja, offline-synchronisatie nee. |
| Libraries | Alleen toevoegen als het aantoonbaar nodig is. Iconen: één set (lucide). |
| Tests | Vitest voor de diagnose-engine. Playwright-screenshots op 360, 390, 430, 1024 en 1440 px. |
| Hosting | Vercel |

## 4. Betrouwbaarheid — harde regels

1. **Verzin nooit** bronnen, paginanummers, fabrikantcitaten, foutcodes, meetwaarden, meetbereiken, artikelnummers of normreferenties.
2. Elke technische bewering krijgt precies één bronlabel:
   - **Fabrikant**: alleen als het document in `content/docs/` staat, met een paginanummer dat je zelf hebt gecontroleerd.
   - **Norm/regelgeving**
   - **Praktijkkennis**: uit `content/diagnoses/`, aangeleverd door de opdrachtgever (zelf cv-monteur).
   - **Algemeen advies**
   - Ontbreekt de bron, dan toon je **"Bron niet beschikbaar"**.
3. **Diagnose-inhoud komt uitsluitend uit `content/diagnoses/`.** Je mag die inhoud structureren en omzetten naar data. Je mag geen eigen technische stappen, oorzaken of waarden toevoegen. Ontbreekt er iets, markeer het dan als `TODO` in de data, toon in de UI "Nog niet beschikbaar" en meld het in je fase-overzicht.
4. Een verwacht meetbereik toon je alleen als het met bron in de data staat. Zonder bereik registreer je de waarde zonder oordeel.
5. **Geen nepfunctionaliteit.** Geen nep-scanner, nep-AI, nep-synchronisatie of nep-resultaten. Wat niet werkt, staat niet in de UI.

## 5. Veiligheid

Elke stap of elk antwoord kan een `safety`-vlag hebben (gaslekkage, CO/rookgasafvoer, elektrische onveiligheid, onveilige toestelconditie). Bij een vlag:

- stopt de normale flow direct;
- verschijnt een volledig **STOP**-scherm: *"Installatie niet verder in bedrijf stellen"*, met de reden, de verplichte veiligheidsactie en de bron;
- kun je alleen verder na een expliciete bevestiging. Wegtikken is niet mogelijk;
- gaat veiligheid altijd boven elke andere visuele regel.

## 6. Productprincipes

1. **Eén beslissing per scherm** tijdens de diagnose. Toon nooit toekomstige stappen.
2. **Contextuele interface.** Wat dominant is, hangt af van de fase:
   - geen toestel gekozen → zoeken;
   - toestel gekozen → acties;
   - diagnose → de huidige stap;
   - meting → de meetinput;
   - klaar → conclusie en rapport.
3. **Progressive disclosure.** "Hoe controleer ik dit", "Waarom" en "Bron" zijn standaard ingeklapt.
4. **Geen chatinterface**, nergens.
5. **Simpel is niet leeg.** Toon precies wat nu relevant is, niet minder en niet meer.

## 7. Visuele richting

**Referentiegevoel:** het display van een professioneel meetinstrument, zoals een rookgasanalyser of digitale manometer. Hoog contrast, grote cijfers, eenheid altijd zichtbaar, status in woord én kleur, niets decoratiefs. Dat gecombineerd met de afwerking van een goede native iOS-app: rustige overgangen, segmented controls, sheets.

**Kleur.** Ontwerp eerst tokens.
- Donkere technische basis (graphite of navy) met een koel lichte achtergrond.
- Eén primaire kleur: volwassen blauw.
- Groen, amber en rood alleen functioneel. **Rood uitsluitend voor veiligheid en kritieke fouten.**
- Praktijkkennis krijgt een subtiele eigen kleur (bijvoorbeeld violet).
- Kleur is nooit de enige informatiedrager.

**Typografie.** Geist of Inter. Tabular numerals voor meetwaarden. Body minimaal 16px. Meetwaarden groot.

**Bediening.** Touch targets van minimaal 48px, bruikbaar met handschoenen. Primaire acties binnen duimbereik.

**Vermijd:** de uitstraling van een component-library-demo, identieke tegels, overal witte cards, card-in-card, een sidebar, gradients en glow, AI-iconen en een marketing-hero.

### IJkscherm: diagnosestap op 390px

Alle andere schermen spreken dezelfde taal als dit scherm.

- **Header (compact):** ← terug · toestelnaam klein (*Intergas HRE 24/18 A*) · rechts "Stop".
- **Status:** *Diagnose actief · Stap 3* met een voortgangsindicator. Toon geen totaal als de flow dynamisch is.
- **Label:** `CONTROLE` (klein, uppercase, ruime letterspatiëring).
- **Vraag:** groot (22–24px, semibold), bijvoorbeeld *"Draait de ventilator bij warmtevraag?"*
- **Instructie:** maximaal twee regels.
- **Antwoorden:** volle breedte, minimaal 56px hoog, verticaal gestapeld in het onderste deel van het scherm. De gekozen staat is onmiskenbaar: gevulde achtergrond plus vinkje.
- **Inklapbaar:** Hoe controleer ik dit · Waarom · Bron (met bronlabel).
- Geen bottom navigation tijdens de diagnose.

## 8. Design system

Centrale tokens voor kleur, spacing, radius, typografie, schaduw, transities en breakpoints. Geen losse styling per pagina.

**Componenten:** `AppHeader`, `DeviceHeader`, `SearchInput`, `Button` (primary/secondary, met pressed-, loading- en disabled-states), `ActionControl`, `SegmentedControl`, `DiagnosisStep`, `DiagnosisChoice`, `MeasurementInput`, `SourceReference`, `SafetyStop`, `StatusLabel`, `ProgressIndicator`, `Disclosure`.

**MeasurementInput:**
- grote numerieke invoer met de eenheid vast ernaast;
- `inputmode="decimal"`, accepteert komma én punt;
- valideert fysiek onmogelijke waarden;
- toont alleen een status als er een bekend bereik is.

**Micro-interacties:** kort en functioneel (press, selectie, stapovergang, uitklappen). Geen animatie om indruk te maken.

## 9. Datamodel (richting)

```ts
type SourceType = 'manufacturer' | 'standard' | 'field' | 'general';

interface Source {
  id: string;
  type: SourceType;
  title: string;
  document?: string;
  page?: number;
  note?: string;
}

interface DiagnosisCase {
  id: string;
  applianceId: string;
  title: string;
  symptoms: string[];
  errorCodes: string[];
  startStepId: string;
  steps: Record<string, DiagnosisStep>;
}

type DiagnosisStep =
  | { type: 'question'; id: string; prompt: string; instruction?: string;
      options: { label: string; next: string; safety?: SafetyFlag }[];
      help?: { how?: string; why?: string }; sourceIds: string[] }
  | { type: 'measurement'; id: string; prompt: string; quantity: string; unit: string;
      range?: { min: number; max: number; sourceId: string };
      next: { inRange: string; outOfRange: string; unknown: string };
      help?: { how?: string; why?: string }; sourceIds: string[] }
  | { type: 'instruction'; id: string; prompt: string; next: string; sourceIds: string[] }
  | { type: 'outcome'; id: string; cause: string; action: string;
      verification: string; sourceIds: string[] }
  | { type: 'safety-stop'; id: string; reason: string; action: string; sourceIds: string[] };
```

**Sessie:** een `DiagnosisSession` met `applianceId`, `caseId`, `path[]` (stepId, antwoord of waarde, tijdstip), `outcome`, `actions`, `notes`. Geef de sessie een vorm die later naar een server kan, want dit wordt de praktijkdata.

**Documentatie:** leg nu alleen de types vast voor Manufacturer → ProductFamily → Appliance → Document → DocumentVersion → Chunk → Citation. Bouw er nog geen ingest voor.

**Diagnose-engine:** pure functies in `src/domain/diagnosis`, zonder UI-afhankelijkheden, met unit tests.

## 10. Structuur en routes

```
src/app/                      routes
src/components/ui/            generieke UI
src/features/                 appliances, search, diagnosis, measurements, sources, service-report
src/domain/                   types + pure logica
src/data/                     getypeerde demodata
src/services/                 grens voor toekomstige AI/API
content/diagnoses/            diagnosebomen (bron: opdrachtgever)
content/docs/                 fabrikantdocumentatie (indien aanwezig)
```

**Routes MVP:**
- `/` — Home
- `/toestellen` — zoeken/kiezen
- `/toestellen/[id]` — toestelpagina
- `/toestellen/[id]/storing` — klacht, foutcode of symptoom kiezen
- `/diagnose/[sessionId]` — diagnose
- `/diagnose/[sessionId]/rapport` — rapport

## 11. Buiten scope

Planning, facturatie, CRM/ERP, voorraad, groothandelkoppelingen, gebruikersrollen, analytics, community, gamification, voorspellende modellen, meerdere merken, scanner/camera, voice en offline-synchronisatie.

## 12. Kwaliteitscontrole

Maak voor elk hoofdscherm Playwright-screenshots op 360, 390 en 430 px en beoordeel ze zelf. Een scherm is **niet klaar** als:

- er horizontaal gescrold kan worden, of iets buiten het viewport valt;
- de lettergrootte of contentbreedte afwijkt van andere routes;
- er desktopgrid- of sidebarruimte zichtbaar is;
- er gebruik wordt gemaakt van `zoom` of `scale` voor layout;
- het eruitziet als een wireframe, een component-demo of een website.

Stel bij elk scherm deze vragen:
1. Waar ben ik?
2. Welk toestel?
3. Wat moet ik nu doen?
4. Welke actie is dominant?
5. Staat er iets wat ik nu niet nodig heb?

**Foutstates (allemaal ontworpen, nooit leeg of met een stacktrace):** toestel niet gevonden, onbekende foutcode, geen zoekresultaat, bron ontbreekt, inhoud nog niet beschikbaar, ongeldige meetwaarde, sessie niet gevonden.

## 13. Werkwijze

- Werk zelfstandig binnen deze beslissingen. Vraag geen toestemming voor kleine UI-keuzes.
- Bij twijfel kies je de eenvoudigste oplossing die uitbreidbaar blijft.
- **Werk één fase per keer en stop aan het einde van die fase.** Begin niet aan de volgende.
- Sluit elke fase af met een kort overzicht:
  - wat is gebouwd;
  - wat werkt echt;
  - wat is bewust niet gebouwd;
  - welke inhoud ontbreekt;
  - risico's;
  - de voorgestelde volgende stap.
