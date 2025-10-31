mkdir -p docs
cat > docs/Hjelpemidler.md <<'MD'
# 🧭 Hjelpemidler – innsamling, bruk og status

## 1. Grunntanke
Hjelpemidler er spesielle gjenstander spilleren samler **underveis på etappen**, og som senere kan brukes for å **vinne byvåpen**.  
De fungerer som permanente ferdigheter – men kan **brukes kun én gang** i selve byquiz-sammenheng.  
Et hjelpemiddel er derfor enten:  
- *ubrukt* (klart til bruk)  
- *brukt riktig* (vunnet, gyllen markering)  
- *brukt feil* (tapt, grålig markering)

## 2. Innsamling underveis på etappen
1. Hjelpemidler er **plassert på forhånd** på bestemte punkter langs etappen (definert i rute-data).  
2. Når spilleren passerer et slikt punkt, trigges en **hjelpemiddel-plakat**:
   - Overskrift: **Hjelpemiddel**
   - En kort forklaring på hva hjelpemidler er og hvordan de brukes
   - Et stort ikon som viser selve hjelpemidlet
   - En knapp: **Fortsett etappen**
3. Når spilleren trykker *Fortsett etappen*, registreres gjenstanden via `bag.addHelp(key)`.  
4. Plakaten lukkes, og spillet fortsetter normalt.  
5. Hjelpemidlet lagres i *Mine ting* og persisteres gjennom `bagPersist` (AsyncStorage).

## 3. Bruk i byquiz
1. Når spilleren får **4 riktige svar** i en byquiz, vises et valgpanel med de hjelpemidler spilleren eier.  
2. Spilleren velger ett ikon – dette representerer forsøket på å “løse byens siste utfordring”.
3. Systemet sjekker byens fasit (`CORRECT_HELPER_FOR_STOP_SLUG[slug]`):  
   - Hvis **riktig hjelpemiddel** brukes →
     - Byvåpen vinnes (spiller har totalt 5 riktige)
     - Hjelpemiddelet markeres som **brukt og vunnet** (gullaktig fargetone)
   - Hvis **feil hjelpemiddel** brukes →
     - Spiller får ikke byvåpen
     - Hjelpemiddelet markeres som **brukt og tapt** (grålig fargetone)
4. Hjelpemidler som er brukt – enten riktig eller feil – kan ikke brukes igjen.

## 4. Status og visuell tilstand
I *Mine ting*-panelet:
- **Ubrukt hjelpemiddel:** standard ikonfarge  
- **Brukt riktig:** gyllen/varm tone  
- **Brukt feil:** grå/avdempet tone  
- Trykk kan senere vise status-tekst (vunnet / tapt / ubrukt)

## 5. Regler og persistens
- Hjelpemidler beholdes mellom økter og etapper (via bag-persist).  
- Ved *soft restart* beholdes alt.  
- Ved *hard reset* (ny profil) slettes alle hjelpemidler.  
- Det kan kun finnes **ett eksemplar av hvert hjelpemiddel** i samlingen.  
- Hjelpemidler er kun aktive i **hoved-etappemodus** – ikke i lynrunde, bonus eller avdekkingsspill.

## 6. Tekniske koblinger
- Fasit: `CORRECT_HELPER_FOR_STOP_SLUG` (slug → helperKey)  
- Innsamling: rute-event under etappe (plakat + `bag.addHelp`)  
- Bruk: byquiz etter 4 riktige → sammenlignes mot fasit  
- Lagring: `bagStore`, `bagPersist`  
- Presentasjon: *MineTingPanel*

## 7. Fremtidig utvidelse
- Flere hjelpemidler og effekter
- Eventer/milepæler som gir hjelpemidler
- Mulige “engangs”-hjelpemidler med re-fill

> Kort: Hjelpemidler samles underveis, lagres i *Mine ting*, og brukes i byquiz. Bruk gir enten **gyllent** (vunnet) eller **grått** (tapt) ikon – og de kan ikke brukes igjen.
MD
git add docs/Hjelpemidler.md
git commit -m "docs: legg til Hjelpemidler.md (innsamling, bruk, status)"
