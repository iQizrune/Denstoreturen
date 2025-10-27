# STRATEGY_NOTES.md
**Prosjekt:** Den store gåturen  
**Dato:** 2025-10-26  
**Formål:** Strategisk dokument for langsiktig stabilitet, ytelse og designkvalitet.

---

## ⚙️ 1. Stabilitetslag og gjenoppretting
Målet er at spilleren aldri skal “miste progresjon”.

**Tiltak:**
- Autosave etter hvert spørsmål:  
  Lagre `lastQuestionId`, `meters`, `lives`, `stopId`, `timestamp`.
- Ved oppstart:
  - Hvis siste lagring < 10 min siden → vis “Fortsett der du slapp”.
  - Ellers → start normal runde.
- På sikt kan autosave utvides til å inkludere `bag` og `stats`.

---

## 💾 2. Dataversjonering og migrasjon
Når appen får flere delsystemer (stats, bag, profil, route):
- Legg til `schemaVersion` i rotnivået for lagring.
- Opprett `migrateState(vOld, vNew)` som flytter eldre lagrede data til nytt format.
- Logg alle migrasjoner i konsollen (kun i DEV).

Dette beskytter mot datatap ved fremtidige strukturendringer.

---

## 🧪 3. Testing og kvalitetssikring
Nå som Jest fungerer:

**Minimumstester:**
- 1 snapshot per hovedskjerm (`start`, `play`, `stop`, `bag`).
- 2–3 enhetstester for:
  - `stageQueue`
  - `bagStore`
  - `pause/resume`
- Én “App boots” sanity-test som verifiserer at `App.tsx` laster uten exceptions.

Dette danner grunnlag for senere CI/CD-sjekker.

---

## 📊 4. Hendelseslogging (senere)
Når testfasen nærmer seg slutt, vurder enkel intern logging:
- Logg nøkkel-hendelser:
  - `answer`, `correct`, `stop`, `bonus`, `pause`, `resume`
- Lagring i minne-buffer (maks 500 entries).
- Eksport til CSV via dev-meny.
- Kan gi verdifull innsikt før backend bygges.

---

## 🎨 5. Felles designsystem
For å sikre helhetlig utseende:
- Opprett `src/theme/theme.ts`
- Standardiser:
  - Fargepalett (`primary`, `accent`, `neutral`)
  - Tekststørrelser
  - Corner radius, shadows, padding
- Komponenter:
  - `AppButton`
  - `AppText`
  - `AppCard`
Dette gir oss ett sentralt sted å endre stil på hele appen.

---

## 🧭 6. Fremtidige moduser (idébank)
Disse skal ikke implementeres nå, men noteres:

| Modus | Beskrivelse |
|-------|--------------|
| **Reprise-modus** | Spill tidligere byer på nytt med nye spørsmål. |
| **Ekspedisjon** | Korte økter (5 min) med mikset spørsmålstyper. |
| **Ukens utfordring** | Et tilfeldig stopp, tre vanskelige spørsmål, ukesbasert leaderboard. |

---

## 🧱 7. Prosess og frys
Fortsett praksisen med:
- `milestonefreeze/`-mapper for alle store steg.
- Én `README.md` som beskriver formålet med hver frys.
- Script for rask restore fra tag (f.eks. `restore_from_tag.sh`).

Dette sikrer reverserbarhet og trygg eksperimentering.

---

*Dokumentet skal ligge i rotmappen sammen med `FUTURE_PLANS.md`.  
Oppdateres når vi tar større tekniske beslutninger.*
