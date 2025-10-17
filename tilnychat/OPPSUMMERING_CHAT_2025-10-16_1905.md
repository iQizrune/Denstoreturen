# Denstoregåturen — Oppsummering fra chat-sesjonen (2025-10-16_1905)

Denne filen oppsummerer hva vi har satt opp, hva som fungerer, hva som gjenstår, og hvordan vi ser for oss veien videre. Den er ment som en **kilde-of-truth** du kan lime inn i ny chat for å gi full kontekst uten å måtte bla tilbake i lang historikk.

---

## 1) Overordnet status

- **Prosjekt**: Expo/React Native app (SDK 53 per nå), utvikles med `expo-router`.
- **Kjører nå**: Splash → Start → (Profile gate) → Play (én-om-gangen-spørsmål) → Results. Kart vises på mobil (native), og enkel info-visning på web.
- **Hovedfokus i denne økten**: 
  - Bygge en _tynn minidirigent_ for delsteg og overgang til stopp.
  - Få “main”-spørsmål i gang (én om gangen) uten kategorikaos.
  - Legge inn meterflyt (+10 m på riktig svar), HUD for meter, og en dev-knapp for å hoppe til 100 m før neste stopp.
  - Røyk-teste stoppmodulen (ArrivalPoster + stoppspørsmål) — **selve overgangen er ennå ikke fullført** (se §5 “Å gjøre”).

---

## 2) Skjermbilder / ruter (app/)

- `app/index.tsx`  
  Redirect til `/home` eller til `/start`, avhengig av hva du valgte i oppsettet.

- `app/start.tsx`  
  Startside. **Profilerings-gate**: sender til `/profile` hvis profil ikke er "complete". Har knapp til å starte quiz.

- `app/profile.tsx`  
  Enkel profiloppsett (navn + aldersgruppe). Lagring via `src/state/profile`. Etter lagring sendes bruker til `/start`.

- `app/home.tsx`  
  Laster `HomePhasePanel` lazy (informasjon/intro).

- `app/play.tsx`  
  Kjerneskjerm for spørsmål. Viktige elementer:
  - Lazy-load av `src/partials/PlayingPanels` (viser **ett spørsmål om gangen**).
  - **HUD** (øverst) som viser `{meters} m` og `Neste stopp om X m`.
  - **Dev-knapp** (nederst) som hopper til **100 m før neste stopp** (brukes til å teste stoppsekvensen raskt).
  - Teller meter ved riktig svar (+10 m).

- `app/results.tsx`  
  Viser enkel resultatvisning med `score` (foreløpig meter-basert) og lenker tilbake til “spill igjen”/hjem.

- `app/kart.native.tsx`  
  Bruker `react-native-maps` for enkel rute: Oslo ↔ Lillehammer (røyk-test). Viser `Marker` og `Polyline`. Henter målmetere fra state når relevant (se §4).

- `app/kart.web.tsx`  
  Viser tekstlig info (ingen web-kart, siden RN Maps er native-only).

- `app/stop.tsx`  
  Inngang til stoppmodul. **Mangler fortsatt full auto-aktivering fra main** (se §5). Importerer `StopModule` og adapter for stoppspørsmål.

---

## 3) Delte komponenter / logikk (src/)

### a) Spørsmål og banker
- `src/partials/PlayingPanels.tsx`  
  Normaliserer ulike spørsmålsbanker til `{ id, text, options[] }` og viser **ett** spørsmål om gangen. Riktig svar → `publishMeters(+10)`.
  - Henter **main-banker** fra flere kilder: `src/banks/local`, `src/banks/core`, `src/banks/bonus`, `src/banks/lightning` (best-effort/try-catch).  
  - **Unngår** by-/stopp-banker i main (disse brukes kun i stoppmodul).  
  - Sikrer fallback hvis en bank er tom eller har annerledes struktur (robust normalisering).

- `src/banks/local.ts`  
  Lokale banker (`BANKS`) med kategorier (`general`, `kunst`, `historie`, `musikk`, m.fl.). Brukes av `PlayingPanels`.

- `src/banks/bonus.ts`, `src/banks/core.ts`, `src/banks/lightning.ts`, `src/banks/util.ts`  
  Ekstra banker og util (bl.a. `shuffle`).

- **Stoppspørsmål (byer)**: Ligger utenfor main-flyten, og brukes kun i stopp:
  - `src/banks/cityAdapter.ts` + `src/banks/adapter.ts`/`index.ts` (leser “byer”-data og normaliserer til stopp-bruk)
  - `src/banks/byer.ts` (datakilde for by-spørsmål per stopp)

### b) Meter-bus / progresjon
- `src/lib/progressBus.ts`  
  Minimal event-bus for meter:
  - `publishMeters(meters)` — sender ny total; lyttere mottar `{ meters, ts }`.
  - `subscribeMeters(fn)` / `onMeters(fn)` — lytte på endringer (returnerer unsubscribe-funksjon).
  - `getMetersSnapshot()` — synkron lesing av sist kjente meter.
  - Brukes av `PlayingPanels` (for å øke meter ved riktig svar) og av `app/play.tsx` (for HUD + dev-jump).

### c) Rute / stopp
- `src/state/route.ts`  
  Snapshot fra rutedata:  
  - `STOP_NAMES`, `STOP_CUM_METERS` og hjelpetypen `Stop { id, name, at }` (fra `src/data/stops` hvis tilgjengelig – eller fallback dummy).  
  - `getStops()` — alle stopp.
  - **(Kommer)** Overvåkning av `meters` for å trigge stopp (se §5).

- Kartdata og stopp-relaterte filer du ga oss (brukt nå / eller for videre arbeid):  
  - `src/data/routeNodes.ts` (rutenoder til kart)  
  - `src/data/stops.ts` + `src/data/stopsIndex.ts` (stoppliste + index)
  - `src/features/stop/StopModule.tsx` (selve stoppsekvensen – visning av byvåpen, by-quiz osv.)  
  - `src/features/stop/ArrivalPoster.tsx` (plakat: “Velkommen til … / bra jobbet! / nå er dette ditt trygge startsted”)  
  - `src/features/stop/coatLookup.ts`, `src/features/stop/coat_images.ts` (byvåpen)

### d) Dirigent (minidirigent)
- `src/engine/conductor.ts` (lett vekt for nå)  
  - **Mål**: tynn koordinator som **pauser main** ved stopp, **aktiverer stoppmodul**, og **resumer** main etter `onComplete`.  
  - Per nå brukes lite direkte; vi lar `app/play.tsx` + route-state gjøre mesteparten. Plan er å flytte “state machine”-ansvaret hit når alt grunnleggende er på plass.

### e) Profil / state
- `src/state/profile.ts`  
  Lagrer/leser profil (navn + aldersgruppe). Eksporterer `getProfile()`, `setProfile()`, `isProfileComplete()`.

---

## 4) Hva fungerer nå

- **Main-quiz flyt**: Ett spørsmål om gangen, riktig svar øker meter (+10).  
- **HUD for meter**: Alltid synlig på `/play` (top overlay), viser “N m • Neste stopp om X m”.  
- **Dev-knapp**: Nederst på `/play`, hopper til **100 m før neste stopp** (for å teste stoppsekvensen raskt).  
- **Kart**:
  - **Mobil (native)**: Enkel rute Oslo ↔ Lillehammer, markører og polyline.  
  - **Web**: Informasjonsvisning (RN Maps er native-only).  
- **Profilerings-gate**: Bruker må ha profil før “Start spill”.  
- **Results**: Tar imot `score` (foreløpig meter-basert) og viser enkel oppsummering.

---

## 5) Viktigste gjenstående arbeid (kort sikt)

1. **Auto-aktivering av stoppmodul**  
   - Sett opp en lytter på `progressBus` som sammenligner `meters` med `nextStop.at` og **navigerer til `/stop`** (eller monterer `StopModule`) når terskelen passeres.
   - Ved inngang til stopp: vis **ArrivalPoster** først, deretter stopp-quizen (byspørsmål fra korrekt by).
   - Når stopp er fullført (`onComplete`): marker stopp som “sett” og **resumer** main (tilbake til `/play`).

2. **Riktig rute fra Lindesnes fyr → Mandal** (første etappe)
   - Sikre at `STOP_CUM_METERS` stemmer (du la ved full liste – vi bruker disse kumulative meterne).  
   - Test at dev-knappen hopper til 100 m før **Mandal**, og at stoppmodulen trigges automatisk.

3. **Kilder til stopp-spørsmål**  
   - Sikre at `cityAdapter` alltid returnerer **kun** spørsmål til riktig by (f.eks. “mandal” når vi ankommer Mandal).

4. **Opprydding i typer**  
  - Sikre en felles `QA`-type og normalisering (vi har gjort mye, men verdt å la alle banker følge samme form der det er mulig).

5. **Oppdeling av ansvar**  
  - Etter at stopp-flyt fungerer stabilt, flytt “state machine”-logikk inn i `src/engine/conductor.ts` (holde view-komponenter tynne).

---

## 6) Veien videre (foreslått rekkefølge)

1. **Hook for stopp-oppdagelse** i `app/play.tsx` (eller i conductor):  
   - På hver meter-oppdatering: sjekk `nextStop` → hvis `meters >= next.at`, naviger til `/stop` (med `params: { id }`).

2. **`app/stop.tsx` sammen med `StopModule`**:  
   - `ArrivalPoster` → byvåpen → by-quiz (fra `cityAdapter(cityId)`), så `onComplete()`.

3. **Resumé og markering**:  
   - Etter `onComplete`: `advanceAfterStop()` (state), resumé til `/play` og fortsett med main-banker.

4. **Ruteutvidelse**:  
   - Utvid kart og `STOP_CUM_METERS` til å matche hele ruta (du har filene).  
   - Senere: animere “you are here”-markør basert på meter.

5. **UI-polish** (når flyt er stabil):  
   - Dedikert start-sekvens: infosider før første spørsmål.
   - Skjule alle kategori-UI (beholde kun spørstekst + alternativer).  
   - Bedre stil på HUD, dev-knapp (kun i dev), og overganger.

---

## 7) Dev-vaner/feilhåndtering vi har lært

- **Ikke bruk kommentarer i shell-kommandoer** (zsh feiler).  
- Bruk alltid **backup før patch** (`.bak.YYYY-MM-DD_hhmmss`).  
- Hold **router-filer enkle** (ingen utils/TS i `app/` som ikke er skjermkomponenter).  
- På web: unngå å importere native-only moduler (som RN Maps). Bruk `.native.tsx` / `.web.tsx`-split.

---

## 8) Sjekklister (operasjonelle)

**Daglig kjøring**  
- `npm run guard` — kjapp røyk-test (health/import/timers/phases).  
- `npx tsc --noEmit` — TS-kompileringssjekk.  
- `npx expo start` — kjør lokalt (Android/iOS).

**Når det låser seg**  
- Lukk alle terminaler, start `expo start` på nytt.  
- Rensk web-cachen om nødvendig.  
- Verifisér at `app/` inneholder _kun_ skjermfiler (ikke utils).

---

## 9) Neste mål (konkret)
- [ ] Koble `meters → /stop` (auto aktivering) og vise `ArrivalPoster` + korrekt by-quiz.  
- [ ] Fullføre første etappe (Lindesnes → Mandal) helt inn og ut av stopp.  
- [ ] Sikre at main aldri viser kategorilister; kun ett spørsmål, én bank om gangen — bak kulissene shuffles det.

---

## 10) Filer vi har jobbet mest med (ikke uttømmende)

- **app**: `start.tsx`, `profile.tsx`, `play.tsx`, `results.tsx`, `home.tsx`, `kart.native.tsx`, `kart.web.tsx`, `stop.tsx`
- **src/partials**: `PlayingPanels.tsx`
- **src/lib**: `progressBus.ts`
- **src/state**: `profile.ts`, `route.ts`
- **src/engine**: `conductor.ts` (minidirigent — bygges ut snart)
- **src/banks**: `local.ts`, `core.ts`, `bonus.ts`, `lightning.ts`, `util.ts`, `adapter.ts`, `cityAdapter.ts`, `index.ts` (og `byer.ts` til stopp)
- **features/stop**: `StopModule.tsx`, `ArrivalPoster.tsx`, `coatLookup.ts`, `coat_images.ts`
- **data**: `stops.ts`, `stopsIndex.ts`, `routeNodes.ts`

---

### Kort konklusjon
Vi har en fungerende **main-quiz** med meterøkning, en tydelig **HUD**, og en **dev-knapp** for å hoppe rett inn i stopp. Neste store milepæl er å **automatisk aktivere stoppmodulen** (ArrivalPoster + by-quiz) når vi passerer et stopp. Når den flyten sitter, flytter vi kontrollen inn i en tynn **dirigent** og bygger ut kart/rute og UI-polish stegvis.
