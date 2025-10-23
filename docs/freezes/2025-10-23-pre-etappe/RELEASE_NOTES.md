# Freeze – 2025-10-23 · Pre-etappe-flyt

## 📦 Sammendrag
Denne frysen markerer at hele flyten fra **Splash → Profil → Pre-etappe → Kart → Tilbake → Etappe 1** fungerer stabilt.  
Frysen ligger som tag: `freeze/2025-10-23-pre-etappe`.

## ✅ Endringer
- Opprettet ny **mellom-plakat**: `app/(game)/pre-etappe.tsx`
  - Inneholder to knapper: *Åpne kart* og *Gå til 1. etappe-plakaten*
  - Bruker `router.push({ pathname: "/kart", params: { returnTo: "/pre-etappe" } })`
- Profil-skjerm (`app/profile.tsx`)
  - “Lagre og fortsett” og “Hopp over” navigerer nå til `/pre-etappe`  
    i stedet for direkte til Etappe 1.
- `app/kart.tsx`
  - Lukk-knappen bruker `router.canGoBack() ? router.back() : router.replace(returnTo || "/play")`
  - Går dermed tilbake til mellom-plakaten hvis den ble åpnet derfra.
- Fjernet “Åpne kart” fra Etappe 1-plakaten (flyttet til mellom-plakat).
- Opprettet midlertidig **stub** `src/banks/cityAdapter.ts` slik at `StopPanel` kompilerer.
- TypeScript og guard-sjekker → grønne.
- Repository koblet opp mot GitHub:  
  [`https://github.com/iQizrune/Denstoreturen`](https://github.com/iQizrune/Denstoreturen)

## 🧭 Filoversikt
