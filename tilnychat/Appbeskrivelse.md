
# Den store gåturen — Appbeskrivelse (ikke‑teknisk)

## Oppdatert 2025-10-15 11:03 — tverr-chat gyldighet
- Prosjektrot er **`Denstoregåturen/`**.
- Styringsfiler ligger i **`tilnychat/`** i prosjektroten.
- `npm run guard` er **valgfritt og kommer senere**; ikke et krav for prosessen nå.
- Dokumentet er gyldig uavhengig av chat-nummer (2, 10, …).
- Alle stier bruker **Denstoregåturen/** som prosjektrot.
- `tilnychat/` er fast mappe for styringsdokumenter og logger.
- `guard`-skript nevnt i enkelte beskrivelser er **ikke påkrevd** per nå.


## Hva er dette spillet?
**Den store gåturen** er en mobilquiz der spilleren går en rute i Norge fra **Lindesnes fyr** til **Kirkenes**. Man beveger seg fremover ved å svare på spørsmål og tjener **meter** i stedet for poeng i hovedløypa. Underveis stopper man i byer/steder (stoppesteder) for egne by‑quizer og for å samle **byvåpen** og **hjelpemidler** i en **sekk**.

Spillet er laget for **mobil** (Android/iPhone). Det skal være raskt, tydelig og lett å utvide med innhold.

---

## Overordnet mål
- For spilleren: 
  - Komme i mål med **færrest restarter**, **færrest spørsmål**, og **raskest samlet spilletid** (tiden tikker bare når man er i et spill).
- For oss (innhold): 
  - Lære spilleren **noe unikt om hvert stoppested** i Norge.

---

## Start på reisen
Ved oppstart velger spilleren:
- **Avatar**, **aldersgruppe** og **brukernavn** (lagres og følger spilleren).
- Spillet starter med **3 liv**. Ekstra liv kan tjenes underveis.

Spillet viser en **splash** med logo. Vi bruker gjennomgående, gjenkjennbare **plakater** (informasjonskort) for viktige modeller (ny etappe, kategori‑intro, velkomst til stopp, osv.).

---

## Rute, etapper og fremdrift
- Ruten består av etapper mellom **stoppesteder** (A→B→C…). 
- Hvert **stoppested** er en **frihavn/sikkert stopp**: har du fullført etappe A→B, starter du senere fra **B**, ikke helt fra A.
- På lange etapper kan det finnes **hvilested** (sikkert delpunkt). Der får man tilbud om å **hvile på hotell** (pausere progresjon uten å miste fremdrift siden sist sikkert punkt).
- Spilleren tjener **meter** ved riktige svar i løypa. Når **500 m** passeres, feires det med **confetti** og **“500M!”**‑markør (en gang per terskel).

**Viktige målparametere:**
- **Restart‑teller:** hvor ofte spilleren måtte starte en ny runde for å nå mål.
- **Spørsmål brukt:** hvor mange spørsmål totalt som ble brukt til å nå mål.
- **Tid brukt:** summert spilletid (kun når et spill pågår).

---

## Spørsmålskategorier i hovedløypa
Disse dukker opp med jevne mellomrom (blandes/shuffles), unntatt stoppespørsmål som bare vises i stoppemodus.

1) **Vanlig/Hoved**  
   - Standard spørsmål (4 alternativer, 1 riktig).  
   - **Belønning:** standard **10 m** per riktig.

2) **Bonus**  
   - Tre vanskelighetsgrader: **lett (20 m)**, **medium (50 m)**, **vanskelig (100 m)**.  
   - Spilleren velger vanskelighetsgrad på forhånd.

3) **Lynspørsmål**  
   - Mål: så mange riktige som mulig innen **15 sekunder**.  
   - **Belønning:** **20 m per riktig** i tidsvinduet.

4) **Triks**  
   - **3 svaralternativer** (eneste kategorien som ikke har 4).  
   - **Poenget:** feil svar er “riktig” (spesielt forklart i en egen plakat første gang).  
   - **Belønning:** **50 m** når “feil” velges i tide (tidsramme f.eks. **3 sekunder**).

5) **Avdekking (reveal)**  
   - Et bilde er **tåkelagt** og blir gradvis klarere.  
   - Jo tidligere riktig gjetning, jo flere meter: **10 m per sekund** igjen når svaret avgis.  
   - Hele bildet vises klart **før tiden går ut**.

6) **Ekstraliv**  
   - Vanlige spørsmål som kan gi **ekstraliv** ved riktig svar.  
   - **Liv** brukes globalt i spillet.

> **Felles regler:** Alle spørsmål **har tidsbar** som går **fra grønn til rød**. Går tiden ut, passerer man automatisk til neste spørsmål. **Svar‑knapper er like** og gir et kort grønt/rødt glimt ved svar.

---

## Stoppesteder (by‑quiz)
- Når spilleren **ankommer et stopp**, går man inn i **stoppemodus** – vanlige spørsmål pauser.  
- **6 spørsmål per stopp** (ikke shuffle).  
- **Byvåpen** vinnes ved **minst 5 av 6** riktige. Byvåpenet **flash’es** kort på skjermen etterpå.  
- **Meter** deles **ikke** ut i stoppemodus – her samler man **poeng/byvåpen**. Samlede stopp‑poeng kan bli en egen faktor i sluttrangering.  
- Etter stopp: en **plakat** spør om spilleren er klar for neste etappe (viser f.eks. “Horten → Drammen” og distanse).

**Hjelpemidler i sekken**  
- Underveis i løypa kan man plukke **hjelpemidler** (én‑gangsbruk).  
- Hjelpemidler **må dukke opp før** det aktuelle stoppet de passer til (f.eks. **harpun** før Sandefjord, “hvalbyen”).  
- Etter stopp‑quiz, i oppsummeringsdialogen, kan spilleren velge å **bruke maks ett** hjelpemiddel for å gjøre **ett feil** om til **riktig**.  
- Brukes et **feil** hjelpemiddel på et stopp, **forbrukes** det uten effekt.  
- Hjelpemidler og byvåpen lagres i **sekken**, som er delt i faner **“Byvåpen”** og **“Hjelpemidler”**.

**Tilgjengelighet for sekk og kart**  
- **Kart** og **sekk** er ikke alltid tilgjengelig.  
- De kan åpnes **på stoppesteder** og **ved hvilesteder**, og ellers der vi eksplisitt tillater det.  
- Kartet åpnes **kun når spilleren ønsker** (ikke automatisk). Sekken åpnes fra kartet.

---

## Vær, utstyr og energi
Spillet simulerer enkel “form/energi” som påvirker meter‑utbetalingen:
- **Tursko:** Noen ganger får spilleren tilbud om **bedre sko** (informasjon forklarer fordelen).  
  - Takker man **nei**, får man kun **90%** av meterbelønningen (avrundet til hele meter) **frem til hvile** eller neste sko‑tilbud.
- **Regn og regnfrakk:** Ved varslet regn kan spilleren ta på **regnfrakk**.  
  - Takker man **nei**, får man redusert målavkastning (samme 90%‑logikk) **til været bedrer seg**.
- Sko og regn **kommer ikke samtidig**. (Mat/drikke kan vurderes senere.)

> Vi bruker **hele meter** (ingen desimaler). All meter‑beregning **rundes umiddelbart**.

---

## Instruksjonsplakater (første gang)
Første gang man møter en spesiell kategori, vises en kort plakat som forklarer reglene:
- **Bonus** (valg av vanskelighetsgrad)  
- **Lyn** (flest mulig på 15 sek)  
- **Triks** (feil = rett; 3 alternativer; kort tid)  
- **Avdekking** (bilde blir klarere; raskere = flere meter)

Plakatdesign er **konsekvent** i hele appen.

---

## Design og brukeropplevelse
- **Konsekvent design:** 
  - Felles **plakat‑mal** (velkomst, etappe‑start, kategori‑intro).  
  - **TimerBar** identisk overalt (grønn→rød, kun varighet endres per kategori).  
  - **Svarknapper** identiske, med kort rød/grønn tilbakemelding.  
  - **Splash** med logo ved oppstart, og logo kan gjenbrukes i små formater senere for helhet.
- **Konfetti og milepæler:** Vises hver **500 m**.  
- **Byvåpen‑flash:** Når byvåpen vinnes i stoppemodus, vises våpenet kort i stort format.
- **Bakgrunnsmusikk:** Spiller lavt i **loop** gjennom spillet (kan skrus av).  
- **Haptikk:** Lett haptisk tilbakemelding ved viktige handlinger.

---

## Highscore og deling
- **Lokal highscore** først (lagres på enheten).  
- Senere kan det åpnes for **online highscore** (på tvers av spillere), med samme måleparametere som over.

---

## Regler for flyt og tid
- **Tiden går bare når man er i et spill** (ikke i menyer, stopp-oppsummeringer, kart, osv.).  
- Når en **tidsfrist går ut**, hopper spillet **automatisk** videre (gjelder alle kategorier, også stoppespørsmål).  
- Spørsmål i hovedløypa **shuffles**, slik at hver ny start føles unik.

---

## Sekken (inventar)
- Viser **Byvåpen** (vinnes i stopp ved ≥5/6) og **Hjelpemidler** (plukkes tidlig, brukes ett i etterkant av stopp).  
- Sekken er **ikke alltid tilgjengelig** – normalt bare på stopp/hvilested.  
- Innholdet presenteres oversiktlig, med egen fanestruktur.

---

## Oppsummering
**Den store gåturen** er en quizreise fra sør til nord i Norge. Riktig kunnskap gir **meter**, stoppestedene gir **byvåpen** og lokal læring. Spilleren må balansere tempo, nøyaktighet og strategi (utstyr, vær, hjelpemidler) for å nå målet raskest, med færrest restarter og færrest spørsmål. Hele opplevelsen er mobil‑først, med tydelig og gjenkjennelig design, korte instruksjoner og jevn fremdrift.

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
