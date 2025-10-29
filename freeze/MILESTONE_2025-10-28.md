# 🧭 Den store gåturen – Milestone 2025-10-28

**Status:** Stabil spillflyt og UI etter implementasjon av byvåpen-logikk, hjelpemiddelplakater og MineTing-integrasjon.  
**Frys-type:** Full Milestone-freeze (alt fra tidligere Milestonefreeze inkludert + ny funksjonalitet).

---

## 📘 Kort sammendrag
Spillet fungerer nå som ønsket både ved **vanlig byquiz-flyt** og ved **bruk av hjelpemidler**:
- Ved ≥5 riktige → spiller får byvåpen + gratulasjonsplakat.  
- Ved 4 riktige → får beskjed om at det finnes en sjanse via hjelpemiddel, og ved korrekt bruk vises egen plakat og belønning.  
- Ved ≤3 riktige → vises “Beklager”-plakat, før automatisk overgang til *Mine ting*.
- Gullfarge-markering av brukte hjelpemidler fungerer.  
- Byvåpen tildeles korrekt og vises i *Mine ting* med riktig ikon.  
- `MineTingPanel` og `StopModule` er nå synkronisert.

---

## 🧩 Nøkkelfiler og moduler
| Fil | Formål |
|-----|--------|
| `src/partials/StopModule.tsx` | Hovedstyring for byquiz. Viser plakat, håndterer hjelpemiddel-logikk, byvåpen og automatisk overgang til *Mine ting*. |
| `src/features/mine-ting/MineTingPanel.tsx` | Viser sekken. Riktig gullmarkering og dynamiske knapper (“Neste etappe”, “Åpne kart”). |
| `src/components/bag/bagStore.ts` | In-memory state for byvåpen og hjelpemidler. |
| `src/lib/stageQueue.ts` | Overgangskø for etappe-start. |
| `src/lib/resumePolicy.ts` | Logikk for om spillet skal gjenoppta runde eller spørre bruker. |
| `src/app-moved/kartBus.ts` | Publisering av “award-coat”-event til kart. |
| `src/data/coat_images.ts` | Auto-generert byvåpen-kart med riktige PNG-ikoner. |

---

## ⚙️ Endringer siden forrige Milestone
1. Fullstendig **hjelpemiddel-flyt** integrert i `StopModule.tsx`.
2. Ny **plakatlogikk (RewardToast)** for tre scenarier:
   - 🟢 Supert: Vant byvåpen direkte  
   - 🟡 Bra: Brukte riktig hjelpemiddel  
   - 🔴 Ikke denne gang: 3 eller færre riktige  
3. `MineTingPanel` oppgradert med:
   - Gullfarge på brukte hjelpemidler.  
   - Riktige byvåpen-ikoner via `COAT_IMAGES`.  
   - Felles knappesett (“Åpne kart” / “Neste etappe”).  
4. `stageQueue`-sjekk lagt til i `play.tsx` for robust montering.  
5. `resumePolicy.ts` aktiv for gjenopptakelse.  
6. Alle feil fra tidligere sesjoner (bl.a. duplikate funksjoner og JSX-ubalanser) er løst.  

---

## ⚠️ Kjente svakheter / observasjoner
- 3-riktige-plakaten er ny og bør observeres visuelt (timing og tekst).  
- `RewardToast`-timingen (1.6s) kan justeres litt opp hvis animasjonen klippes.  
- “Byquiz ferdig”-plakaten er nå helt fjernet; bør overvåkes for eventuelle avhengigheter.  
- `SafeAreaView` gir fortsatt deprecate-warning – kan byttes til `react-native-safe-area-context`.  

---

## 🚀 Neste mikro-mål
1. Finjuster varighet og animasjon på plakater.  
2. Vurdér felles plakatkomponent for alle “reward”-scenarioer.  
3. Implementér visning av antall riktige på hjelpemiddelplakaten (opsjon).  
4. Forbered ny *Milestone-freeze 2025-11-01* etter testperiode.

---

## 🧾 Commit-rutine (bruk alltid før ny freeze)
```bash
git add -A
git commit -m "milestone(2025-10-28): full byvåpen- og hjelpemiddel-flyt stabilisert"
git tag -a milestone/2025-10-28 -m "Milestone 2025-10-28"
git push origin main --tags
```

---

## 🕓 Kort CHANGELOG
| Dato | Hendelse |
|------|-----------|
| 2025-10-18 | Første versjon av hjelpemiddel-flyt introdusert |
| 2025-10-21 | `stageQueue`-stabilisering |
| 2025-10-24 | `MineTingPanel` rework |
| 2025-10-27 | Gullfarge på hjelpemiddel + riktig ikonvisning |
| **2025-10-28** | 🎯 Stabil Milestone: alle plakater og byvåpenflyt fungerer |
