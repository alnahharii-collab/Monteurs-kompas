# Monteur Kompas — V4 (oefendemo)

Mobiel-eerst hulpmiddel voor servicemonteurs: toestel kiezen → storing kiezen →
controles één voor één → uitkomst → servicerapport. Plus **Snel opzoeken** en
**Documentenbeheer** (via *Meer*).

> **Oefendemo · niet voor praktijkgebruik.** Alle toestellen, storingen,
> grenswaarden en bronnen in `src/data/demo.ts` zijn **fictief**. Er is geen
> echte fabrikantinformatie opgenomen. Velden die niet vastgelegd zijn (versie,
> pagina) worden niet getoond.

## Commando's

```bash
npm install
npm run dev        # ontwikkelserver
npm run typecheck  # tsc --noEmit
npm test           # vitest (logica + UI-flow)
npm run build      # typecheck + productie-build naar dist/
```

Screenshots en layoutmetingen (na `npm run build` en `npx vite preview --port 4173`):

```bash
node scripts/screens.cjs screenshots   # 360/390/430/1280 px + metrics.txt
node scripts/compare.cjs screenshots   # Start / Toestel kiezen / Snel opzoeken naast elkaar
```

## Opbouw

- `src/App.tsx` — AppShell: één header, één `.container` voor alle schermen.
  Navigatie via een view-stack in de sessiestate (geen router).
- `src/styles.css` — het enige design system (tokens, kaarten, knoppen, status).
- `src/logic/session.ts` — sessie-reducer: invalidatie bij wijzigen van toestel,
  uitvoering, storing of eerder antwoord; veiligheidsstop-vergrendeling.
- `src/logic/diagnosis.ts` — beslisboom evalueren en afhankelijke antwoorden snoeien.
- `src/logic/measure.ts` — meetinvoer (Nederlandse komma; leeg ≠ 0).
- `src/logic/report.ts` — servicerapport uit uitsluitend geregistreerde gegevens.

## Gedrag dat bewust zo is

- **Veiligheidsstop**: blokkeert elke wijziging aan de case (terug, andere
  storing/toestel, antwoord wijzigen). Blijft zichtbaar op alle schermen, ook in
  Snel opzoeken. Alleen *Nieuwe case starten* (met bevestiging) heft hem op.
- **Opslag**: alles staat alleen in het geheugen van het tabblad. Terug en bron
  openen behouden de case; verversen of sluiten wist alles.
- **Bronnen**: "gekoppeld" betekent niet "inhoudelijk gecontroleerd"; dat wordt
  overal zo getoond.
