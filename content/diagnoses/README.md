# Diagnosebomen

Elke `.json` in deze map is één diagnosecasus (bestanden die met `_` beginnen worden overgeslagen).
De inhoud komt **uitsluitend** van de opdrachtgever. De app voegt zelf geen stappen, oorzaken of waarden toe.

Na het toevoegen of wijzigen: `npm test` controleert elk bestand. Een fout (kapotte verwijzing, onbekende bron,
fabrikantbron zonder pagina) laat de build falen. Ontbrekende inhoud markeer je met `"TODO"`. De app toont dan
"Nog niet beschikbaar".

## Opbouw

```json
{
  "case": {
    "id": "geen-warm-water",
    "applianceId": "intergas-kombi-kompakt-hre-24-18-a",
    "title": "Geen warm water",
    "symptoms": ["Geen warm water uit de kraan"],
    "errorCodes": [],
    "startStepId": "stap-1",
    "steps": {
      "stap-1": {
        "type": "question",
        "id": "stap-1",
        "label": "Controle",
        "prompt": "…vraag…",
        "instruction": "…max. twee regels…",
        "options": [
          { "label": "Ja", "next": "stap-2" },
          { "label": "Nee", "next": "TODO" },
          {
            "label": "Gaslucht",
            "next": "TODO",
            "safety": { "category": "gas-leak", "reason": "…", "action": "…", "sourceIds": ["praktijk"] }
          }
        ],
        "help": { "how": "…", "why": "…" },
        "sourceIds": ["praktijk"]
      }
    }
  },
  "sources": [{ "id": "praktijk", "type": "field", "title": "Praktijkkennis opdrachtgever" }]
}
```

### Staptypes

| type | velden | verder via |
|---|---|---|
| `question` | `prompt`, `instruction?`, `options[]` (min. 2), `help?` | `options[].next` |
| `measurement` | `prompt`, `quantity`, `unit`, `range?` `{min,max,sourceId}`, `limits?` `{min?,max?}` | `next.inRange` / `next.outOfRange` / `next.unknown` |
| `instruction` | `prompt`, `instruction?` | `next` |
| `outcome` | `cause`, `action`, `verification` | einde |
| `safety-stop` | `category?`, `reason`, `action` | einde (STOP-scherm) |

- **Meetbereik** wordt alleen getoond als `range.sourceId` naar een bestaande bron wijst. Zonder bereik legt de
  app de waarde vast zonder oordeel en gaat via `next.unknown`. "Niet gemeten" gaat ook via `next.unknown`.
- **`limits`** zijn fysieke grenzen (waarden die niet kunnen bestaan), geen normwaarden.
- **Veiligheid** (`category`): `gas-leak`, `flue-gas`, `electrical` of `unsafe-appliance`. Een `safety`-vlag op een
  antwoord stopt de flow. Na expliciete bevestiging gaat de diagnose verder naar `next`.

### Bronnen (`sources[].type`)

| type | label in de app | eis |
|---|---|---|
| `manufacturer` | Fabrikant | `document` (bestand in `content/docs/`) **en** zelf gecontroleerde `page` |
| `standard` | Norm/regelgeving | |
| `field` | Praktijkkennis | aangeleverd door de opdrachtgever |
| `general` | Algemeen advies | |

Een stap zonder `sourceIds` toont "Bron niet beschikbaar".
