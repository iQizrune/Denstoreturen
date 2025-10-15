# Den store gåturen — Appbeskrivelse (teknisk)
_Sist oppdatert: 2025-10-12 18:19 UTC_

## Oppdatert 2025-10-15 11:03 — tverr-chat gyldighet
- Prosjektrot er **`Denstoregåturen/`**.
- Styringsfiler ligger i **`tilnychat/`** i prosjektroten.
- `npm run guard` er **valgfritt og kommer senere**; ikke et krav for prosessen nå.
- Dokumentet er gyldig uavhengig av chat-nummer (2, 10, …).
- Alle stier bruker **Denstoregåturen/** som prosjektrot.
- `tilnychat/` er fast mappe for styringsdokumenter og logger.
- `guard`-skript nevnt i enkelte beskrivelser er **ikke påkrevd** per nå.


> Formål: Dette dokumentet skal ligge i repoet og lastes opp i starten av hver ny chat for å sikre kontinuitet. Det beskriver **arkitekturvalg**, **moduler**, **datastrøm**, og **kontrakter** uten å være låst til en bestemt implementasjonsdetalj. Vi kan revidere det kontrollert over tid.

---

## 1. Plattform, rammeverk og mål
- **Målplattform:** iOS og Android (mobil-only).
- **Stack:** React Native med **Expo Router** (ruter i `app/`).
- **Språk:** TypeScript.
- **Bygg:** EAS (senere), utvikling via `npx expo start -c --lan`.
- **Design-prinsipp:** Modulær, testbar, “dumme” visningskomponenter, **én** dirigent (Conductor) som eier spillflyten.

---

## 2. Overordnet arkitektur
```
app/                    # ruter/skjermer + route-nære biter
components/             # gjenbrukbare UI-komponenter (Themed*, Bag*, Posters, Confetti, osv.)
src/
  engine/               # spillmotor (Conductor, regler, timere, adapters)
    Conductor.ts        # eneste sannhet om fase, posisjon, meter, liv, tid, hendelser
    rules/              # rene funksjoner: scoring, miks, vær/sko, milepæler
    timers/             # én timer-service med clean start/stop
    adapters/           # banks->ManagedQ, bus-adaptere, persistens-adaptere
  banks/                # spørsmålsbanker + index (all import fra denne "barrel")
  data/                 # statiske mappinger (coat_images, ev. routeStops)
  storage/              # AsyncStorage-wrappere (profil, highscores, prefs, snapshot)
  theme/                # theme.ts + useThemeColor/useColorScheme hvis brukt
assets/                 # bilder, avdekking, flagg, lyd, logo
tilnychat/              # SAMARBEID.md, Appbeskrivelse.md, Appbeskrivelse_teknisk.md
archive/                # gamle/legacy filer vi ikke bruker men vil bevare som referanse
```

**Kjernen:** Conductor eksponerer et lite, stabilt API og **events**. UI abonnerer og presenterer.

---

## 3. Conductor (dirigent) — ansvar og grensesnitt
### 3.1 Ansvar
- **Fasebytte:** `home → playing → stop → summary → (map/bag) → playing …`
- **Spm-sekvens:** henter fra banks via adapter, bestemmer kategori-miks, starter timer.
- **Scoring:** beregner meter etter kategori-regler + håndterer **handicaps** (sko/regn).
- **Progresjon:** oppdaterer etapper (A→B), **sikre punkt** (frihavn/hvilested), publiserer til kart/progress-bus.
- **Stoppemodus:** 6 spørsmål, teller riktige, **byvåpen ved ≥5/6**, etterdialog for hjelpemiddel (maks 1).
- **Sekken:** administrerer byvåpen og hjelpemidler; åpnes kun når lov.
- **Tid:** fører “aktiv spilletid” (kun når spill pågår).
- **Milepæler:** oppdager 500m, 1000m, … og signaliserer konfetti.
- **Persistens:** snapshot av profil, prefs, posisjon, state som trengs ved resume.

### 3.2 Inndata (commands)
- `startNewGame(profile)`, `resumeFromSafePoint()`
- `answer(questionId, optionId)`
- `timeExpired()`
- `acceptShoes()` / `declineShoes()`
- `putOnRaincoat()` / `skipRaincoat()`
- `enterStop(stopIndex)` / `finishStop()`
- `useStopHelper(helperId)` (i oppsummeringsdialog)
- `openBag()` / `openMap()` / `restAtInn()`
- `mute(onOff)` / `pause()` / `resume()`

### 3.3 Utdata (events/callbacks)
- `onPhaseChange(phase)`
- `onQuestion(next: ManagedQ, timerSpec)`
- `onMeters(delta: number, total: number)`
- `onMilestone(meters: number)`  (500, 1000, 1500 …)
- `onLivesChange(lives: number)`
- `onWeatherStart(kind)` / `onWeatherEnd(kind)`; `onShoesOffer()`
- `onStopSummary({ correct, total: 6, wonCoat: boolean })`
- `onBagUpdate(items)`
- `onConfetti(kind: "milestone" | "coat")`
- `onTimerTick(msLeft)` / `onTimerEnd()`

> **Viktig:** Dirigenten er **rammeverksagnostisk**. UI kobles på via props/hooks som lytter til disse eventene.

---

## 4. Spørsmål og ManagedQ
### 4.1 Rå banker
- Ulike banker kan ha ulik “dialekt” (`label` vs `text`, `medium` vs `middels`, bilde som streng/require).
- Alle banker **importeres kun** via `src/banks/index.ts`.

### 4.2 ManagedQ (visningsformat)
Før UI ser et spørsmål, mappes det til:
```ts
type ManagedQ = {
  id: string
  kind: "main"|"bonus"|"flag"|"reveal"|"trick"|"lightning"|"extralife"|"stop"
  text: string
  options: { id: string; label: string }[]   // som regel 4; trick = 3
  correctId: string
  media?: { type: "image"|"reveal"; key: string } // avdekking/bilde-nøkkel
  meta?: { difficulty?: "enkel"|"medium"|"vanskelig"|"umulig"; tags?: string[] }
}
```
- Adapter per bank konverterer fra rå format til `ManagedQ`.
- **Reveal:** `media.type="reveal"` med nøkkel/sti som kan resolves til `require()` ved behov.
- **Stop:** `ManagedQ.kind="stop"` for by-quiz.

---

## 5. Kategori-regler (scoring og tid)
Alle spørsmål har **tidsbar** (grønn→rød); ved utløp: gå videre.

- **Main/Vanlig:** 4 alternativer. **+10 m** ved riktig.
- **Bonus:** vanskelighetsvalg før spørsmål. Belønning: **lett 20 m**, **medium 50 m**, **vanskelig 100 m**.
- **Lyn:** svar så mange du rekker på **15 sek**. **+20 m per riktig** i tidsvinduet. (Timer global for runden.)
- **Triks:** **3 alternativer**. Kort tid (f.eks. **3 s**). **Feil svar** gir **+50 m**. (Motor håndterer “feil=rett”.)
- **Avdekking (reveal):** Bilde avdekkes gradvis. **+10 m per sekund igjen** ved korrekt gjetning. Hele bildet vises klart før tiden er over.
- **Ekstraliv:** 4 alternativer. Riktig gir **+1 liv** (ingen meter).

**Stoppesteder:** 6 spørsmål (ikke shuffle), **meter deles ikke ut**. Ved **≥5/6**: vinn **byvåpen** (flash vises). Etterpå kan **ett** hjelpemiddel brukes for å endre ett feil til riktig.

---

## 6. Handicaps og utstyr
- **Sko:** av og til får man tilbud om bedre sko. Takker man **nei**, mottar man **90%** av meter fra riktige svar **til hvile** eller neste sko-tilbud. (Alltid hele meter, rundes etterpå.)
- **Regnfrakk:** ved regn. Takker man **nei**, gjelder samme **90%** inntil **været bedrer seg**.
- **Sko og regn kommer ikke samtidig.**
- (Mat/drikke kan legges til senere i samme mønster.)

**Rekkefølge for beregning:**
1) Grunnscore per kategori
2) Avrund til heltall hvis nødvendig
3) Handicap (90%) → **rund til heltall umiddelbart**
4) Oppdater total meter og sjekk **milepæler** (500m-intervaller)

---

## 7. Etapper, sikre punkter og hvilested
- Hver etappe har `{ fromStopIndex, toStopIndex, startMeters, endMeters }`.
- **Frihavn**: Ankomst til stopp lagrer posisjon; senere starter du aldri før det.
- **Hvilested**: Valgfrie sikre delpunkter mellom A og B. Velger man å **hvile på hotell**, lagres fremdrift frem til dette punktet.
- Conductor publiserer **kart-hendelser** (til kartBus): `show-stage`, `arrived-stop`, `award-coat`.
- `progressBus` publiserer nye meter (`publishMeters(m)`), slik at kart og ev. toppbar kan oppdatere seg.

---

## 8. Sekk (inventory)
- **Byvåpen** (pr. stopp) og **Hjelpemidler** (én-gangsbruk). Lagres i egen store.
- Sekken åpnes **kun** når Conductor tillater: stopp/hvilested (og ev. andre eksplisitte punkter).
- Etter stopp: i oppsummeringsdialogen kan man **bruke maks ett** relevant hjelpemiddel. Feil bruk forbruker det uten effekt.

---

## 9. Persistens (lokal først, online senere)
- **AsyncStorage**-nøkler (forslag):  
  - `app:profile` (navn, avatar, aldersgruppe)  
  - `app:mute`, `app:highscores`  
  - `app:progress` (posisjon, liv, meter, milepæler, utstyrstilstand, pågående etappe-id)  
- **Snapshot-strategi:** Én “atomic” `saveSnapshot()` ved sikre punkter og ved avslutning.  
- **Veien mot online:** Hold et rent `HighscoreAPI`-interface som kan byttes fra local→remote senere.

---

## 10. Tids- og animasjonsmodell
- Én timer-service i `src/engine/timers`:  
  - API: `start(scope, ms, onTick, onEnd)`, `stop(scope)`, `reset(scope)`  
  - Kategori-spesifikke varigheter lever i `constants`/`rules`.  
- Animasjoner (konfetti, knappeflash) holdes i UI-laget; Conductor sender bare events.

---

## 11. Milepæler og konfetti
- **Terskler:** hver **500 m** (500, 1000, 1500, …).
- Conductor holder `milestonesHit:Set<number>` for å unngå duplikat-emits.
- `onMilestone(m)` → UI viser kort konfetti + “500M!” emoji-sticker (kortvarig).

---

## 12. UI-kontrakter
- **TimerBar** er identisk overalt; forskjellig **varighet** pr. kategori, samme gradient (grønn→rød).
- **Svarknapper** er identiske, med kort **rød/grønn** feedback ved svar.  
- **Plakat-mal** brukes til: velkomst, kategori-intro (Bonus/Lyn/Triks/Avdekking), stopp-ankomst, neste etappe.  
- **Kart** åpnes manuelt (fra bruker). Sekk åpnes normalt via kartet.  
- **Bakgrunnsmusikk** spiller lavt i loop; kan slås av (mute lagres).

---

## 13. Navngiving, data og konsistens
- **Stopp-ID:**  
  - Spørsmålsbank for stopp bruker **index** (eks. 61= Mandal).  
  - Byvåpen/hjelpemidler bruker **slug** (`"mandal"`, `"sandefjord"`).  
  - Vi holder en enkel lookup-tabell `index ⇄ slug` i `data/routeStops.ts`.
- **Bank-dialekter:** Egen adapter pr. bank (label/text, difficulty medium/middels, image-streng/require).
- **Assets:** Favoriser `require()` for lokale bilder (Metro), men adapter kan resolve strenger.

---

## 14. Konstanter (eksempel)
- **Belønning i meter:** main 10; bonus (lett 20, medium 50, vanskelig 100); lyn 20 per riktig; triks 50; avdekking 10 per sekund igjen.  
- **Tidsvinduer:** main X s; lyn 15 s (rundens total); triks 3 s; reveal Y s; ekstra Z s; stopp W s pr spørsmål (verdier konkretiseres i `constants/game.ts`).  
- **Handicap:** 90% ved nei til sko/regn (avrund straks til heltall).

---

## 15. Testing og kvalitet
- **Regler** i `src/engine/rules/` er rene funksjoner → enkle å teste (jest).  
- **Conductor**: smoke-tests for “faseflyt”, “milepæler”, “stopp ≥5/6 gir våpen”.  
- **Bank-adaptere**: tester for at alle varianter mappes korrekt til `ManagedQ`.
- **Ytelse**: lazy-load av store banker/kategorier hvis nødvendig.

---

## 16. Feature flags og dev-modus
- Minimal `devFlags` for lokal testing (f.eks. start i playing, hopp til nær mål, mock vær). Samles i **én** fil (ikke flere).
- Ingen `globalThis`-staters; kun modulære store/rules.

---

## 17. Tilgjengelighet og språk
- Kontraster og fontstørrelser som fungerer på små skjermer.
- Tekster legges i én kilde (`i18n`-vennlig senere).

---

## 18. What not to do
- Ikke flere parallelle styringsflagg (f.eks. `phase` + `quizMode`). Fase **er** sannheten.  
- Ikke multiple timer-mekanismer for samme ting.  
- Ikke globale mutasjoner via `globalThis`.  
- Unngå flere filer med samme domenenavn som betyr ulike ting (f.eks. to `stops.ts`).

---

## 19. Migrering fra legacy
- `archive/GameApp.legacy.tsx` beholdes kun som referanse for ideer (ikke importeres).  
- Eventuelle legacy-konfig/featureflaggs samles i én ny, ryddig kilde.

---

## 20. Minimal “første mile” (når vi implementerer)
1) Conductor som kan: fase → playing, vise “main”-spørsmål fra banks via adapter, telle meter, trigge **500m-konfetti**.  
2) Koble **stoppemodus** (6 Q, ≥5/6, byvåpen, enkel sekk-oppdatering).  
3) Legge på **lyn** (15 s), **triks**, **bonus**, **reveal**, **ekstraliv** gradvis.

---

**Status:** Dette dokumentet beskriver _valgene_ — ikke den endelige koden. Vi oppdaterer det når vi justerer regler, moduler eller filplasseringer.

### Slik lagrer du terminal-output til logg (anbefalt)
Kjør fra **Denstoregåturen/** når output er lang:
```bash
LOG="tilnychat/SETUP_LOG_$(date +%F_%H%M).txt"
mkdir -p tilnychat
echo "# Setup-logg $(date)" | tee "$LOG"

( git rev-parse --show-toplevel || echo "ingen .git her" ) 2>&1 | tee -a "$LOG"
git status 2>&1 | tee -a "$LOG"
git log --oneline -n 10 2>&1 | tee -a "$LOG"
git tag --list 2>&1 | tee -a "$LOG"

ls -la | tee -a "$LOG"
[ -f package.json ] && cat package.json | tee -a "$LOG"
[ -f tsconfig.json ] && cat tsconfig.json | tee -a "$LOG"

npx tsc --noEmit 2>&1 | tee -a "$LOG" || true
```

### Frys-rutine (tag)
Standard liten frys etter milepæl (fra **Denstoregåturen/**):
```bash
git add -A
git commit -m "docs: oppdatert dokument (2025-10-15 11:03)"
git tag freeze/2025-10-15-milepæl
```
Rollback:
```bash
git tag -d freeze/2025-10-15-milepæl || true
git reset --hard HEAD~1
```
