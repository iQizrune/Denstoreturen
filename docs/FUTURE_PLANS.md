# FUTURE_PLANS.md
**Prosjekt:** Den store gåturen  
**Dato:** 2025-10-26  
**Status:** Dokumentert plan for fremtidige mål og designretning.

---

## 🎯 Overordnet visjon
Spillet skal være et **langtidsprosjekt for spilleren**, med en sterk følelse av progresjon, eierskap og personlig reise fra Lindesnes til Kirkenes.  
Alt skal kunne gjenopptas sømløst, og spilleren skal føle at appen “husker dem”.

---

## 🗺️ Kart
- Brukes **kun som visning** mellom etapper, ikke som interaktiv navigasjon.
- Vises også ved definerte **pauser** i spillet.
- “Åpne kart”-knappen kan brukes fra infosider, stoppmodul og pauser.

---

## 🧠 Spillmodus og logikk
- Kun **singleplayer-modus**.  
- På sikt skal spillerens data kunne sammenliknes globalt mot andre spillere.
- Ved avbrudd (f.eks. telefon, app i bakgrunn):
  - Hvis spørsmål pågår → **hopp til neste spørsmål** ved gjenopptak.
  - Hvis i pause, stopp, start e.l. → behold konteksten.
- Mål: Spilleren bør helst **avslutte økter etter ferdig spørsmål**.

---

## 🧭 “Mine ting” (Bag)
### Funksjon
- Blir **hoved-/pauseskjermen** for spilleren.
- Skal være tilgjengelig:
  - ved start av spill,
  - i stoppmodus (etter quiz ved by),
  - i pauser.
- Skal **ikke** være aktiv mens spørsmål besvares.

### Innhold
- **Byvåpen**: vunnet for hvert stopp (unikt pr. by).
- **Hjelpemidler**: kan brukes i spillet.
- **Statistikkpanel** (kommer):
  - Antall liv brukt totalt.
  - Antall riktige svar per kategori:
    - bonus, lyn, ekstra-liv, trick, reveal, hoved.
  - Antall ganger spilleren har måttet starte på nytt (ikke full reset).
  - Antall byvåpen vunnet.
  - Antall hjelpemidler brukt korrekt.
  - Effektiv spilletid (akkumulert aktiv tid).
- **Pausehåndtering:** “Mine ting” skal også fungere som pauserom.

---

## 💾 Lagring og persistens
Alt skal kunne gjenopptas fra samme punkt.

### Lagringsstruktur (AsyncStorage, versjonert schema)
- `state:v1`  
  - `run`: totalMeters, lives, sessionTime
  - `route`: nextIndex, seenStops, lastStopCompletedAt
  - `bag`: items (coats, helps)
  - `stats`: se over
  - `profile`: navn, preferanser
  - `flags`: interne UI-flagg (pauseOverlay, revealActive, osv.)

### Reset-funksjon
- Spilleren skal kunne **nullstille alt** via menyvalg (“Start helt på nytt”).

---

## 📊 Global måling (senere fase)
- Sammenligning mellom spillere skjer ved **definerte sjekkpunkter**, f.eks.:
  - Etter endt stopp.
  - Etter bestemte pauser i etapper.
- Appen sender snapshot-data (meter, tid, statistikk) for å generere globale rangeringer.
- Leaderboard implementeres i et senere stadium (krever backend).

---

## 🧩 Teknisk videreutvikling
- Full **AsyncStorage-hydrering før splash skjules**.
- **Pause-/resume-system** via AppState og `advanceOnResume`-flagget.
- **Test- og sikkerhetslag**:
  - Jest-tester for lagring/hydrering og `stageQueue`.
  - Freeze-mapper og pre-commit-sjekker for å beskytte fungerende kode.
- **“Nullstill alt”-funksjon** skal trigge full sletting av lagringsnøkler og soft-restart.

---

## 🧱 Langsiktig visjon
- Et spill som føles som en reise: rolig, kontinuerlig progresjon, personlig eierskap.
- Spillerens innsats og valg skal bygges opp over mange økter.
- Appen skal motivere til:
  - å komme tilbake ofte,
  - å forbedre egen effektivitet,
  - å nå Kirkenes med minst mulig antall “nye starter”.

---

*Denne filen skal ligge i rotmappen og oppdateres ved nye beslutninger.*
