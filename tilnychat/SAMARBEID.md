
# SAMARBEID – fast prosessmal for nye chatter

## Oppdatert 2025-10-15 10:58 — tverr-chat gyldighet
- Prosjektrot er **`Denstoregåturen/`**.
- Styringsfiler ligger i **`tilnychat/`** i prosjektroten.
- `npm run guard` er **valgfritt og kommer senere**; ikke et krav for prosessen nå.
- Dokumentene er skrevet for å være **gyldige i hvilken som helst chat (#2, #10, …)**.
- Alle stier og eksempler bruker **Denstoregåturen/** som prosjektrot.
- `tilnychat/` er vår faste mappe for samarbeidsfiler, oppsummeringer og logger.
- `guard`-skriptene nevnt tidligere er **ikke påkrevd**; vi etablerer dem senere ved behov.

> Legg denne fila i `tilnychat/SAMARBEID.md` og last den opp i starten av **hver** ny chat.
> Denne fila handler om **hvordan** vi jobber (ikke spillreglene – de ligger i egen SpillInfo-fil).

## 0) Formål
- Sikre at alle chatter er **lojale** mot forrige chat og følger samme arbeidsform.
- Minimere feil ved å være **objektive**, eksplisitte og jobbe i **mikrosteg**.

## 1) Svarstil og modus
- Språk: **norsk (bokmål)**. Kort og presis.
- Ja/nei-spørsmål: svar **kun** “ja” eller “nei”.
- Standard **MODE = DIAGNOSE** (ingen kodeendringer).
- Når jeg skriver **“diff nå”**: lever **én** samlet unified diff for **avtalte filer**, med **rollback-steg**.

## 2) Mikrosteg-format (A, B, C – evt. A1, A2)
Hvert steg skal inkludere:
- **Mål**: hva som skal skje/synes (forventet effekt).
- **Tiltak**: 1–3 konkrete kommandoer/handlinger (A, B, C / A1, A2).
- **Verifikasjon**: hva jeg skal sjekke (visuelt/logg).
- **Rollback**: presise steg for å rulle tilbake ved feil.
- **Mini‑logg**: “Dette ble gjort / dette ble ikke gjort”.

## 3) Sannhetsplikt og filhåndtering
- **ALLTID** les filer grundig før forslag.
- **ALDRI** gjette når reell info finnes eller kan innhentes.
- **ALDRI** si at noe er gjort uten at det faktisk er gjort.
- Hvis en fil ikke kan leses: **si fra umiddelbart** og stopp steget.
- Ikke overøs med oppgaver: **maks 1–3 kommandoer** per steg.

## 4) Verifikasjon (“grønn-signal” sjekkliste)
- `npx tsc --noEmit` uten feil.
- `npm run guard` (og `npm run verify` hvis finnes) er grønn.
- Expo dev‑klient starter uten røde feil.
- Ingen nye relevante gule runtime‑varsler fra steget.
- Den avtalte, synlige effekten oppnås.

## 5) Git‑flyt
- Små, hyppige commits:  
  `git add -A && git commit -m 'feat/fix/refactor(scope): kort beskrivelse'`
- Jevn **push** for å unngå store tap:  
  `git push` (+ tags ved frys)
- Frys/tag ved milepæler:  
  `git tag freeze/YYYY-MM-DD-HHMM`

## 6) Filsett som skal lastes opp i ny chat
- **SAMARBEID.md** (denne fila – **prosessen**).
- **SpillInfo** (egen fil: struktur, regler, mål med spillet – oppdateres når noe endres).
- **Oppsummering** (kort status fra forrige økt, dagens mål, neste mikrosteg).

## 7) Ambiguitet, tempo og rollback
- Ved minste uklarhet: **pause og spør** før tiltak.
- Ved feil midt i batch: **stopp og rollback**. Fortsett uten rollback **kun** hvis løsningen er 100% trygg og umiddelbar.

## 8) Presentasjon av kommandoer
- Maks 1–3 kommandoer.
- Merk dem A, B, C (evt. A1–A2 hvis de hører sammen).
- For hver kommando: angi **mål/forventet effekt** og **forventet output** (hva jeg skal se).

## 9) Standard verktøy
- Start Expo: `npx expo start -c --lan`
- TypeScript-sjekk: `npx tsc --noEmit`
- Verifikasjon: `npm run guard` (+ `npm run verify` hvis finnes)

---
**Merk:** Denne fila er prosess-malen. Spillregler, kategorier, rute, mål og designprinsipper samles i **SpillInfo-fila** som også lastes opp i ny chat.

Dataflyt og kilder (avtalt)
Stopp & distanse genereres fra routeData.ts → skriver src/data/stops.ts (STOP_NAMES, STOP_CUM_METERS). Ingen manuell redigering av stops.ts.
Byvåpen: alle assets ligger i assets/coats/*.png. En generator lager/oppdaterer src/data/coat_images.ts og sjekker at alle STOP har coat og omvendt. Ingen manuell endring i coat_images.ts.
Navnestandard (slugs): kun [a-z0-9-], norske tegn normaliseres (å→a, ø→o, æ→ae), mellomrom/tegn → -, ingen doble bindestreker, ingen trailing -.
🧱 Kode-moduler (scope)
UI-skjermbilder: app/… (Expo Router).
Delte komponenter: components/….
Data & generatorer: src/data/… (kun output-filer + små hjelpe-TS). Generatorscripts kjøres manuelt via kommando-blokker.
State-bus (event/subscribe): app/lib/*Bus.ts med cleanup som returnerer void.
🧪 TypeScript og kvalitet
tsc --noEmit skal være grønn før vi går videre til neste oppgave.
Importalias @/* peker til repo-rota; bruk relative stier hvis tvil.
Ingen any uten at det står i oppgaven. Hvis midlertidig, merk med // TODO:.
🖼️ Assets
Coats: PNG (forutsigbar i React Native). SVG kan ligge i midlertidig/ for konvertering, men ikke brukes direkte i appen.
Avatars/flags/reveal: hold lettvektsfiler; unngå >300 KB pr. bilde.
🧩 Spillregler (oppsummering for implementasjon)
Ingen desimaler; all avansement i meter avrundes fortløpende.
Trick: 3 alternativer; feil svar er «riktig» (gir meter), riktig svar gir 0.
Stoppesteds-quiz: 6 spørsmål; ≥5 riktige → byvåpen. Akkurat 4 riktige → tilbyr hjelpemiddel (én sjanse) via oppsummeringsplakat.
Sekken: åpnes kun der appen tillater det (stopp + bestemte punkter). Hjelpemidler er éngangs.
🧑‍💻 Samarbeidspraksis (presiseringer)
Kommandoblokker merkes: A1:, A2: … én hensikt per blokk. Jeg skriver hva du skal se som resultat etter kjøring.
Jeg bekrefter alltid hvilke filer jeg har lest (bane/filnavn) og hva jeg ikke kunne lese.
Ved duplikatfiler foreslår jeg arkivering (_archive/…) med begrunnelse.
Ingen gjetting når kilden finnes; jeg ber heller om fil/utdrag.
🔁 Generator-kommandoer (referanse)
Oppdater coats-mapping + sjekk mot STOP:
Beskrivelse: Leser assets/coats/*.png → skriver src/data/coat_images.ts og rapporterer mangler/ekstra.
Bygg stops.ts fra routeData.ts:
Beskrivelse: Leser midlertidig/routeData.ts → skriver src/data/stops.ts (navn + kumulative meter). Kryssjekker mot routeNodes.ts hvis tilstede.
🧰 Feilrapportering
Når noe feiler: lim inn feilmelding + fil + linje (kort), og hva som skjedde/ikke skjedde. Jeg svarer med en målrettet retting av gangen.

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
