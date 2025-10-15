
# OPPSUMMERING – Den store gåturen (prosjektstatus & retningslinjer for ny chat)

## Oppdatert 2025-10-15 10:58 — tverr-chat gyldighet
- Prosjektrot er **`Denstoregåturen/`**.
- Styringsfiler ligger i **`tilnychat/`** i prosjektroten.
- `npm run guard` er **valgfritt og kommer senere**; ikke et krav for prosessen nå.
- Dokumentene er skrevet for å være **gyldige i hvilken som helst chat (#2, #10, …)**.
- Alle stier og eksempler bruker **Denstoregåturen/** som prosjektrot.
- `tilnychat/` er vår faste mappe for samarbeidsfiler, oppsummeringer og logger.
- `guard`-skriptene nevnt tidligere er **ikke påkrevd**; vi etablerer dem senere ved behov.


**Dato:** auto-generert oppsummering  
**Formål:** Denne filen følger prosjektet mellom samtaler. Den gir rask innføring for en ny ChatGPT-session og beskriver hva som allerede er besluttet, hvor ting ligger, og hva som er «den røde tråden». **Ny chat skal forholde seg til denne filen** og ikke finne opp alternative løsninger uten eksplisitt avtale.

---

## 1. Konsept (spillet i korte trekk)
- **Navn:** *Den store gåturen*.
- **Reise:** Fra **Lindesnes fyr** til **Kirkenes** via en definert rute i Norge med mange stopp.
- **Mekanikk:** Man tjener **meter** (ikke poeng) ved riktige svar i hovedløypa. Målet er å **nå målet med færrest ny-starter**, **færrest spørsmål** og **lavest samlet spilletid** (tid går kun når spillet er aktivt).
- **Sikkerhetspunkter:**
  - **Stoppesteder (frihavn):** Fullførte etapper låses; man starter ikke helt på nytt.
  - **Hvilesteder:** Mellompunkter mellom stopp – reduserer tap ved feil, ingen full reset.
- **Spørsmålskategorier:**
  - **Hoved (vanlig)** – standard 4 alternativer.
  - **Bonus** – velg *lett/medium/vanskelig* (20/50/100 m).
  - **Triks** – 3 alternativer; «feil er riktig». Belønning: 50 m ved «feil». Første gang vises plakat som forklarer.
  - **Lyn** – svar så mange som mulig på 15 sek; 20 m pr. riktig.
  - **Avdekking (reveal)** – bilde «tåkes» og blir klarere; 10 m pr. sekund igjen ved korrekt gjetning (må være helt klart før tiden går ut).
  - **Stoppesteds-quiz** – 6 spørsmål om stedet. **5+ riktige** gir **byvåpen (coat)**. Gir **ikke meter**, men **poeng** til sluttresultat.
  - **Ekstraliv-spørsmål** – gir ekstra liv ved korrekt svar.
- **Meterverdier (default):**
  - Hoved: 10 m, Lyn: 20 m/korrekt, Triks: 50 m (på «feil»), Bonus: 20/50/100 m, Avdekking: 10 m per gjenstående sekund.
- **Liv:** Start med 3 liv. Ekstraliv via egen kategori.
- **Feil på tid:** Alle kategorier hopper videre uten straff utover uteblitt gevinst.
- **Visuelle/UX-regler:**
  - Felles **Splash** med logo, og konforme **informasjonplakater** (instruksjon, velkommen til stopp, bonus, lyn, avdekking, triks).
  - **Timebar** felles design, gradient **grønn → rød**.
  - **Svar-knapper**: identisk design; ved valg **glød grønn/rød** kort (feedback).
  - **Konfetti + “500M!”** emoji for hver passerte 500 m.
  - **Byvåpen** vises stort kort ved opptjent coat.
- **Audio:** BGM (music.mp3) i loop, med mute-innstilling i AsyncStorage.
- **Avatar/Profil:** Velg avatar, aldersgruppe, brukernavn i start. Følger spilleren. Highscore kommer senere (lokal først, skalerbar til online).
- **Kart & sekk/bag:**
  - Kart viser fremdrift & etapper.
  - **Sekken** samler **byvåpen** (coats) og **hjelpemidler** (items). Den er kun **åpen** på stopp/steder vi bestemmer (ikke overalt). Faner i UI for «Byvåpen» og «Hjelpemidler».
- **Vær/sko/energi:**
  - **Regnfrakk:** Når det regner, kan spiller ta på frakk. Uten frakk → meterreduksjon (f.eks. 90% av gevinsten) inntil været blir bedre.
  - **Tursko:** Kan velge bedre sko; **uten** gode sko → 90% av meter fra riktige svar frem til hvile eller nytt skotilbud.
  - (Mat/drikke kan komme senere – samme prinsipp. Ingen desimaler – avrunding til hele meter.)
- **Hjelpemidler (items):**
  - Engangsbruk. Eksempel: **Harpun** kan «forvandle» **4/6** riktige til **byvåpen** i **Sandefjord** (hvalbyen).
  - Brukes **kun** i oppsummeringsdialogen etter stoppesteds-quiz, og **kun ett** hjelpemiddel pr. stopp.
  - **Riktig kontekst** gir byvåpen; **feil** kontekst forbruker hjelpemiddelet uten gevinst.
  - Hjelpemidler må dukke opp **i god tid** før relevant stopp (3 000–50 000 m før).

---

## 2. Data og struktur som allerede er på plass
- **Rute & stopp:**
  - Kilde: `midlertidig/routeData.ts` (rå-data). Vi ekstraherer **LEGS** og bygger:
    - `src/data/stops.ts` med **STOP_NAMES** (rekkefølge langs ruta) og **STOP_CUM_METERS** (kumulative meter, heltall). Genereres med skript.
  - **Koordinater:** `src/data/routeNodes.ts` (fra `route-globals.js`). Inneholder `{ slug: {name, lat, lng} }` for markører og etappevisning.
- **Byvåpen (coats):**
  - Bildefiler: `assets/coats/<slug>.png`
  - Automatisk mapping: `src/data/coat_images.ts` genereres fra faktiske PNG-er (med kontroll mot STOP_NAMES).
  - Konsistenssjekk verifisert: 60 stopp ↔ 60 coats (per siste kjøring).
- **Spørsmålsbanker (banks):**
  - Struktur i `src/banks/`: `core.ts` (hoved), `bonus.ts`, `trick.ts`, `extraLife.ts`, `flags.ts`, `reveal.ts`, `lightning.ts`, `byer.ts`, `stops.ts` (stoppestedsquiz), `util.ts`, `types.ts`, `index.ts` (aggregerer).
  - **Shuffle** brukes (uten side-effekter).
  - **4 alternativer** alle steder, **unntatt triks** (3 alternativer).
- **Event-bus’er (pub/sub):**
  - `app/lib/kartBus.ts` – publikasjon av *show-stage / arrived-stop / award-coat* (kart-oppdatering m.m.).
  - `app/lib/progressBus.ts` – publikasjon av meter-progresjon.
- **Bag/sekk-store:**
  - `components/bag/bagStore.ts` – enkel global state for byvåpen (coat) + andre items. Har `addCoat`, `addItem`, `subscribe`, `getItems`, `hasCoat`.
- **Visuelle komponenter (utvalg):**
  - `components/ThemedText.tsx`, `components/ThemedView.tsx`, `components/ui/*` (TabBar, Collapsible, osv.).
  - `components/StopModule.tsx` – stoppestedsmodus (ny fil på vei inn, med støtte for hjelpemiddel ved **nøyaktig 4/6** riktige).

---

## 3. Design og UX-retningslinjer
- **Konformitet:** alle plakater deler layout/typografi; samme UI-mønster for start ny etappe, velkomst, instruksjoner for kategorier.
- **Timebar:** felles komponent, grønn→rød.
- **Svar-knapper:** identisk utseende, kort «blink» grønt/rødt ved svar.
- **Konfetti:** hver 500 m (500M! markør).
- **Bilder:** vurdert nøysomt (ytelse > «tunge» foto). 
- **Splash/logo:** gjenbrukes i appen (varierende størrelser).

---

## 4. Teknologi og prosjektstruktur
- **Expo + React Native + TypeScript.** Målplattform: **mobil (iOS/Android)**.  
- **Expo Router** i bruk (app/ som rutestruktur).  
- **AsyncStorage** for lokalt lager (avatar, mute, siste score, highscores lokal). Nøkler prefiks `app:` (migrering fra `Denstoregåturen:` finnes som *valgfri* engangsfunksjon).
- **Filstruktur (hoved):**
  - `app/` – skjermer (router), UI-spesifikke filer.
  - `components/` – gjenbrukbare komponenter (StopModule, plakater, UI).
  - `src/data/` – rute, stopp, byvåpen-mapping.
  - `src/banks/` – spørsmålsbanker og util/types.
  - `assets/` – bilder/lyd (coats, avatars, images, music).
  - `tilnychat/` – samarbeidsfiler (SAMARBEID.md, OPPSUMMERING.md, etc.).
  - `_archive/` – alt legacy/ikke i bruk (rydder bort støy).
- **Tema:** Vi starter i **mørk modus**. Egen `src/theme/theme.ts` (enkle fargekonstanter).  

---

## 5. Samarbeidsregler (kortversjon, full versjon i SAMARBEID.md)
1. **Objektivitet over positivitet.** Ikke anta; **les filer nøye** før forslag.
2. **Ikke gjett** når faktisk info finnes. Si ifra hvis filer ikke kan leses.
3. **Små steg.** Maks 1–3 oppgaver per «batch». Alltid mål/forventet resultat per steg.
4. **Citatsannhet:** Når vi henviser til filer, bruk nøyaktig sti/linje når relevant.
5. **Git/prøving:** Hyppige commits. Unngå store utestede endringer.
6. **Script først:** Repetitivt → egne skript (f.eks. generere `stops.ts`, `coat_images.ts`).
7. **Arkivér** ved tvil (ikke slett) – `_archive/`.
8. **Ny chat** skal **respektere** denne oppsummeringen og *ikke* introdusere ny arkitektur uten avtale.

---

## 6. Hva som nylig er gjort (automatisering)
- **Generering av `src/data/stops.ts`** fra `midlertidig/routeData.ts` (bygger STOP_NAMES, LEGS og STOP_CUM_METERS).
- **Generering av `src/data/coat_images.ts`** fra faktiske PNG-er i `assets/coats/` + kontroll mot STOP_NAMES.
- **Rydding:** Mange legacy-filer flyttet til `_archive/`.

---

## 7. Åpne punkter / «Neste skritt» (prioritert rekkefølge)
A. **StopModule fullføring:**  
   - Implementere logikk for **4/6→hjelpemiddel**-dialog (ett forsøk, ett hjelpemiddel, korrekt kontekst = byvåpen).  
   - Integrasjon med `bagStore` (coats & items), samt med `publishAwardCoat`.  
B. **Dirigent (Game Orchestrator):**  
   - Egen modul som styrer faser: fri flyt i hovedløype → stoppestedsmodus → plakat for neste etappe.  
   - Abonnerer på `progressBus`/`kartBus`, deler ansvar i moduler (ikke monolitt).  
C. **Timer/Countdown:**  
   - Felles hook for timebars (bonus, lyn, triks, avdekking, stopp). Ulike varigheter per kategori.  
D. **Vær/sko-handikap:**  
   - Tilstand per «aktivt vær»/«sko valgt?» + prosentvis meter-reduksjon (90%). Utløser på signaler (tilfeldig/konfig).  
E. **Funfacts-modul ved stopp:**  
   - Frivillig del før/etter stoppestedsquiz; 2–3 lette spørsmål → **fast meterbonus** for kommende etappe. Ingen overlap med stoppespørsmål.  
F. **Highscore & profil:**  
   - Lokalt først (AsyncStorage). Design for senere sync/server.
G. **Kart:**  
   - Vis ruten mellom `from→to` (valgfritt polylines), markører, «frihavn»-markering, og hvilepunkt.

---

## 8. Forventninger til ny chat / nye bidragsytere
- Les **denne filen** + `tilnychat/SAMARBEID.md` før du foreslår arkitektur.
- Før du lager kode: **Avklar** modulplassering/filnavn.
- Ikke introduser alternative «spørsmålsbank-formater» – bruk `src/banks/`.
- Ikke rør `src/data/stops.ts` eller `src/data/coat_images.ts` manuelt – bruk skriptene.
- Behold modulær oppdeling; **ingen monolittiske** komponenter.

---

## 9. Korte svar på ofte stilte (fra tidligere runder)
- **Hvor mange stopp?** Per nå **60** i STOP_NAMES (fra rutefil).  
- **Coats?** 1 pr. stopp; visning etter opptjening; lagres i sekk.  
- **Bilde-formater?** Coats i PNG (konvertert fra SVG ved behov).  
- **Avhengigheter?** Expo/React Native/TypeScript/AsyncStorage – konservative versjonskrav.  
- **Tidsmåling:** Summeres for aktive spilløkter, ikke idle.

---

## 10. Status: mappe-/filnøkler (for ny chat)
- **Rute:** `src/data/routeNodes.ts` (noder med lat/lng), `src/data/stops.ts` (navn + kum. meter).
- **Byvåpen:** `assets/coats/*.png` + `src/data/coat_images.ts` (auto-generert).
- **Spørsmål:** `src/banks/*` (core, bonus, trick, lightning, reveal, extraLife, byer, util, types).
- **Event-bus:** `app/lib/kartBus.ts`, `app/lib/progressBus.ts`.
- **Bag:** `components/bag/bagStore.ts`, `components/bag/BagPanel.tsx`, `components/bag/BagIcon.tsx`.
- **Stop-modus:** `components/StopModule.tsx` (WIP/ny).

---

### «Slik jobber vi videre» (kort)
1) Hold deg til dette dokumentet. 2) Foreslå små, verifiserbare steg. 3) Lag skript for generering. 4) Arkiver ubrukte filer. 5) Test ofte.

---

*Dette dokumentet er levende. Oppdateres når vi tar nye beslutninger.*

### Slik lagrer du terminal‑output til logg (anbefalt)
Bruk dette når output blir lang. Kjør fra **Denstoregåturen/**:
```bash
LOG="tilnychat/SETUP_LOG_$(date +%F_%H%M).txt"
mkdir -p tilnychat
echo "# Setup-logg $(date)" | tee "$LOG"

# Eksempler (du kan legge til | tee -a "$LOG" på alt du vil logge)
( git rev-parse --show-toplevel || echo "ingen .git her" ) 2>&1 | tee -a "$LOG"
git status 2>&1 | tee -a "$LOG"
git log --oneline -n 10 2>&1 | tee -a "$LOG"
git tag --list 2>&1 | tee -a "$LOG"

ls -la | tee -a "$LOG"
[ -f package.json ] && cat package.json | tee -a "$LOG"
[ -f tsconfig.json ] && cat tsconfig.json | tee -a "$LOG"

# Valgfritt (hvis TypeScript er satt opp)
npx tsc --noEmit 2>&1 | tee -a "$LOG" || true
```

### Frys‑rutine (tag)
Standard liten frys etter milepæl (fra **Denstoregåturen/**):
```bash
git add -A
git commit -m "docs: oppdatert samarbeids/oppdateringer (2025-10-15 10:58)"
git tag freeze/2025-10-15-milepæl
```
Rollback av siste commit/tag:
```bash
git tag -d freeze/2025-10-15-milepæl || true
git reset --hard HEAD~1
```
