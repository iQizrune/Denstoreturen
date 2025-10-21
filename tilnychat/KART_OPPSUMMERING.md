# KART_OPPSUMMERING.md
## Status per 2025-10-19  
**Prosjekt:** Den store gåturen  
**Hovedfil:** `components/map/MapViewSvg.tsx`  
**Formål:** Dynamisk kartvisning av hele ruten (Lindesnes → Kirkenes) med markører, etapper, og interaktiv zoom/pan.

---

## 🧭 1. Hovedmål og kontekst

Målet med denne modulen er å vise hele Norge-ruten som en interaktiv visuell opplevelse:

- Ruten er delt i etapper (“legs”), hver med mange koordinatpunkter (langs vei, ikke luftlinje).  
- Brukeren ser en kart-oversikt og kan **zoome/panne** med fingrene.  
- Den **aktive etappen** skal vises tydelig (blå linje).  
- **Andre etapper** vises dempet (røde linjer).  
- **Stoppesteder** vises som prikker med navn – den aktive er blå, de andre røde.  
- Kartet åpner alltid **sentrert på aktiv etappe** eller **aktivt stoppested**.  

Dette er altså en *egentegnet SVG-kartløsning* uten ekstern map-SDK. Den fungerer helt offline og henter data fra prosjektets egne JSON- og TS-filer.

---

## ⚙️ 2. Filene som inngår

| Fil | Rolle |
|-----|-------|
| **`components/map/MapViewSvg.tsx`** | Tegner hele kartet med SVG, håndterer pan/zoom/labels. |
| **`app/kart.tsx`** | Wrapper-komponent som laster rutedata (`route-legs.json`) og gir det videre til `MapViewSvg`. |
| **`assets/route/route-legs.json`** | Inneholder alle koordinatpunkter for etappene. |
| **`src/types/route.ts`** | Definerer `RouteLeg` og `RoutePoint`-typene. |
| **`src/data/stops.ts`** | Liste over stoppesteder i rekkefølge (Lindesnes → Kirkenes). |
| **`src/data/stopsIndex.ts`** | Funksjoner for å slå opp stopp etter meter og hente neste stopp. |
| **`assets/route/route-globals.js`** | Global liste over alle byer/steder med lat/lng. |
| **`app/lib/progressBus.ts`** | Formidler meter-progresjon via `publishMeters` / `onMeters`. |
| **`src/hooks/useCurrentStopIndex.ts`** | Hook som lytter til `onMeters` og finner aktivt stopp. |

Disse filene utgjør kartets "datastrøm" fra posisjon (meter) → stopp → etappe → kartvisning.

---

## 🧩 3. Hva som ikke fungerte tidligere

Vi har forsøkt flere forskjellige tilnærminger:

| Tilnærming | Resultat |
|-------------|----------|
| **Innebygget WebView (HTML-kart)** | Fungerte dårlig på mobil; treg, lav ytelse, dårlig gesture-støtte, vanskelig synk med React-state. |
| **Google Maps via SDK** | Krever API-nøkkel, online-avhengighet, komplisert å style offline-rute. |
| **Egendefinert HTML + SVG i WebView** | Gav visuell kontroll, men ble tung og laggy (scroll/zoom for tregt). |
| **Nåværende løsning (React Native SVG)** | ✅ Beste så langt — rendrer alt nativt, raskere og mer stabilt. |

Årsaken til at vi gikk **helt bort fra WebView** er:
- for mange synk-problemer mellom `window.ROUTE_LEGS` og RN-state,
- mangel på finger-kontroll (pinch/pan føltes “låst”),
- treghet på Android.

---

## 🧠 4. Hvordan `MapViewSvg.tsx` fungerer nå

### a) Datastrøm
1. `app/kart.tsx` laster inn `route-legs.json` og `stops.ts`.
2. Disse sendes som props til `MapViewSvg`.
3. `MapViewSvg` tegner alle etapper (`legs`) som røde linjer og den aktive som blå.
4. Stopper (`stops`) vises som sirkler med tekstetiketter.
5. Aktive stopp og etapper zoomes automatisk inn ved start.

### b) Pan/zoom
- Gesturer håndteres manuelt via `PanResponder` + `touch` events.  
- Smooth animasjon oppnås med *lerping* (gradvis overgang) i en `requestAnimationFrame`-loop.  
- Zoom begrenses via `clampZoom()` (nå 0.5 → 60).  
- Alle markører og labels skaleres motsatt av zoom slik at de holder fast størrelse på skjermen.

### c) Visuell logikk
- **Aktiv etappe:**  
  - Blå linje + lys blå “glow” under (for kontrast).  
  - All rød rute skjules for akkurat denne etappen.  
- **Øvrige etapper:**  
  - Tynne røde linjer (`strokeWidth=2.5`).  
- **Stopp:**  
  - Røde sirkler med hvit kant.  
  - Aktive stopp er blå.  
  - Navn vises i liten tekst, med hvit halo for lesbarhet.  
- **Info-chip:**  
  - Øverst til høyre: viser `fra → til` + distanse i km for aktiv etappe.  
- **HUD (debug):**  
  - Nederst til venstre: viser antall etapper, aktiv indeks, antall punkter og viewport-størrelse.

---

## 🎨 5. Hva som er forbedret

| Område | Før | Nå |
|--------|-----|----|
| Zoomnivå | Maks 30 | Maks 60 (dobbel detalj) |
| Pan-ytelse | Laggy | Smoothet via lerping og høyere frame rate |
| Aktive etapper | Utydelige | Tydelig blå linje m/glow |
| Labels | Manglet | Klare navn ved hvert stopp |
| Farger | Flat | Profesjonelt palett med kontrast og halo |
| Struktur | Spredt mellom filer | Nå samlet og stabil `MapViewSvg`-base |

---

## 🚧 6. Hva som kan forbedres videre

| Mulighet | Effekt | Vanskelighetsgrad |
|-----------|---------|-------------------|
| **Zoom-adaptiv label-synlighet** | Skjul bynavn ved lav zoom → ryddigere kart | 🟢 enkel |
| **Auto-zoom animasjon** | Når ny etappe starter → smooth overgang | 🟢 enkel |
| **Polyline-smoothness** | Interpoler flere mellompunkter → runde kurver | 🟡 middels |
| **Kart-bakgrunn (grått Norge)** | Legg til SVG-outline av Norge under ruten | 🟡 middels |
| **Rute-fremdrift (markør)** | En liten blå prikk som flytter seg langs etappen basert på meter | 🔵 viktig for senere |
| **Filter etter region/etapper** | Mulig å “hoppe” mellom landsdeler | 🔵 fremtid |
| **Overgang til ekte map SDK** | Hvis online-data ønskes (Google/Mapbox) | 🔴 omfattende |

---

## 🛠️ 7. Kommandoer vi har brukt aktivt

| Type | Kommando | Bruk |
|------|-----------|------|
| **Typecheck** | `npx tsc --noEmit` | Sjekker at alt kompilerer uten feil |
| **Start appen** | `npx expo start --dev-client --lan` | Starter bundler for testing på Android |
| **Backup fil før patch** | `cp "$F" "$F.bak_$(date +%s)"` | Tar sikkerhetskopi før overskriving |
| **Automatisk patch via Node** | ```node - <<'NODE' "$F"``` … ```NODE``` | Trygg inline-patch av filer |
| **Søk/grep** | `rg -n "MapViewSvg" app/kart.tsx` | Raskt finne linjer i prosjektet |
| **Test justering** | `Math.min(60, z)` → endrer zoomgrense | Brukes ved små tweaks |

---

## 🔮 8. Plan for neste faser

1. **Integrere fremdrift:**  
   Bruke `publishMeters` → flytt en blå markør langs ruten (viser hvor langt man har kommet).  
   Dette gir liv til kartet uten å kreve ny logikk i `MapViewSvg`.

2. **Zoom adaptivt:**  
   Skjul labels og detaljer under zoom x<3 for å holde kartet rent.

3. **Kartbakgrunn:**  
   Legg inn enkel outline av Norge (`norge-outline.svg`) i grått bak ruten.

4. **Regionvisning:**  
   Etterhvert kunne velge Sør-Norge, Midt-Norge, Nord-Norge som filtrerte utsnitt.

5. **Ytelsesforbedring:**  
   Splitte rendering i “static layer” (røde etapper) og “active layer” (blå) for mindre re-render ved zoom.

---

## ✅ 9. Oppsummering

- **Kartet fungerer stabilt.**
- **Pan/zoom og interaksjon er smooth og offline.**
- **Ruten vises korrekt basert på `route-legs.json`.**
- **Aktiv etappe fremheves tydelig.**
- **Neste steg:** vis fremdrift på ruten, evt. vis bakgrunns-outline av Norge.

Dette er nå et solid fundament som både ser profesjonelt ut og kan bygges videre på uten risiko.

---

## 💡 10. Anbefalt videre prosedyre

Når du starter en ny chat:
1. Last opp denne `KART_OPPSUMMERING.md`.  
2. Skriv “les oppsummering og sett kontekst”.  
3. Da vil assistenten vite alt om hvordan kartet fungerer og hvor vi står.  
4. Deretter kan vi legge til f.eks. fremdriftsmarkør, outline eller region-zoom i mikro-steg.

---

**Sist oppdatert:** 2025-10-19  
**Av:** GPT-5 / Kart-modul arbeidslogg  
