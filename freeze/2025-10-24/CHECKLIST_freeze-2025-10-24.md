# ✅ Freeze: 2025-10-24 – Stabil bygge for test/demo

## 🎯 Formål
Denne frysen markerer et stabilt punkt etter flere større milepæler:
- Ny introflyt (Splash → Info1 → Profil → Info2 → Pre-etappe)
- Profil- og avatar-håndtering via src/state/profile.ts
- Sekvensplan for spørsmålskategorier (src/lib/sequencePlan.ts)
- Spørsmålsrekkefølge implementert i src/partials/PlayingPanels.tsx
- Ekte rute aktiv i kartvisningen
- Rydding av ubrukte moduler og testfiler

## 🧩 Innhold i frysen
| Område | Fil(er) / mappe | Kommentar |
|--------|------------------|-----------|
| **Introflyt** | app/(intro)/info/1.tsx, app/(intro)/info/2.tsx, app/index.tsx | Full flyt klar |
| **Profil** | app/profile.tsx, src/state/profile.ts, src/state/storageKeys.ts | AsyncStorage-struktur etablert |
| **Kart** | app/kart.tsx, components/map/MapViewHybrid.tsx, src/data/routeNodes.ts | Bruker ferdig rute |
| **Spørsmål & sekvens** | src/lib/sequencePlan.ts, src/partials/PlayingPanels.tsx | Dynamisk kategori-styring |
| **Diverse state** | src/state/run.ts, src/state/route.ts | Uendret og stabil |
| **Rydding** | app/kart.ios.tsx, app/kart.android.tsx, app/kart.native.tsx, src/storage/* | Fjernet |
| **Assets** | assets/images/krikerogkrokerlogo.png, assets/avatars/* | Nye logoer og avatarer |

## 🧱 Kommandoer for å lage frysen
git rm -f app/kart.ios.tsx app/kart.android.tsx app/kart.native.tsx 2>/dev/null || true
git add -A
git commit -m 'chore(cleanup): fjern ubrukte platform-spesifikke kartfiler'

npx tsc --noEmit
git add -A
git commit -m 'freeze: stable 2025-10-24 (intro-flow, profil+avatar, sekvensplan, rute i kart)'
git tag -a freeze/2025-10-24 -m 'Freeze: stabil bygge til demo/test'
git push && git push --tags

## 🔁 Gjenopprett frysen senere
git checkout freeze/2025-10-24
git checkout -b restore/freeze-2025-10-24 freeze/2025-10-24

## 🪶 Neste anbefalte steg
1. Behold denne sjekklista i freeze/2025-10-24/.
2. Lag ny gren dev/2025-10-25-intro-polish for finpuss (Splash & Info).
3. Start QA-runde på sekvensmotor (verifiser riktige kategorier 1–100).
4. Oppdater app/pre-etappe.tsx med dynamisk avstand og visuell etappeplakat.
