# Logo Recipe – “Den store gåturen”

Formål: En robust, reproduserbar oppskrift for å lage/oppfriske logoen (splash/app-ikon/branding) uten å miste identiteten.

## 1) Navn og tagline
- **Navn:** Den store gåturen
- **Kort beskrivelse:** Quiz + norgesreise fra Lindesnes til Kirkenes. Meters, stopp, byvåpen, tursko/regnfrakk.

## 2) Fargepalett (hexfarger)
- Primær blå: `#0B66D4`
- Aksent rød (rute/markør): `#D32F2F`
- Mørk bakgrunn: `#0B0B0E`
- Lys tekst: `#FFFFFF`
- Sekundær grå: `#1F2430`

## 3) Typografi (forslag)
- Overskrift: Inter / SF Pro / Manrope (Bold/700)
- Brødtekst: Inter / SF Pro / Manrope (Regular/400)
- Tall (meters): Tabular numerals hvis mulig

## 4) Ikonidé (semantikk)
- Symbol: **sti/linje** fra sør→nord + **tursko** eller **kompassnål**
- Form: Rundt eller squircle for app-ikon; horisontal versjon for splash
- Minst mulig detaljer, god lesbarhet i små størrelser

## 5) Genereringsparametre (AI)
Bruk disse uansett verktøy (tilpass feltnavn):
- **Prompt (grunnidé):**
  “Minimalist logo mark for a Norwegian travel quiz app called ‘Den store gåturen’. A clean route line from south to north with a subtle boot/compass motif. Flat design, solid fills, balanced negative space, high contrast, brand colors (#0B66D4, #D32F2F, #0B0B0E, #FFFFFF). No photo, no 3D, no gradients. Vector-friendly.”

- **Negativ-prompt:** “photo, realistic, 3d render, gradient, shadow clutter, noisy texture, text artifacts”
- **Style:** “flat, minimalist, vector, logo mark”
- **Seed:** `2025_103`  *(kan endres ved behov, men logg alltid ny verdi)*
- **Aspect ratio:**
  - Ikon: 1:1 (1024×1024)
  - Splash: 3:2 (1500×1000) + en ren 1:1 versjon
- **Variasjoner:** sett `variations: 3–6` første runde

## 6) Promptvarianter (for A/B-testing)
- **Variant A (linje + støvel):**  
  “Minimal flat logo: a single bold line representing a journey across Norway with a small hiking boot silhouette at the northern end. Use #0B66D4 and #D32F2F for accents, dark background #0B0B0E, clean negative space, vector look.”
- **Variant B (linje + kompass):**  
  “Flat logo mark: a northbound path ending in a simple compass needle. Crisp geometry, no gradients, brand colors, vector-friendly.”
- **Variant C (kartkontur hint):**  
  “Abstract hint of Norway’s vertical shape as negative space, with a clear route line overlay and a tiny boot icon. Minimal, sturdy, flat vector.”

## 7) Eksport-mål
- **App-ikon:** 1024×1024 PNG (alfa), uten tekst
- **Splash-logo:** min. 1000×1000 PNG (på transparent) + hvit mono-versjon
- **SVG:** 1× ikon og 1× horisontal “lockup” (symbol + ‘Den store gåturen’)

## 8) Godkjenningstjekk (kvalitetskriterier)
- Lesbar i 24×24 px
- Fungerer i mono (hvit på mørk bakgrunn)
- Rute/retning forstås umiddelbart
- Ikke for mye detaljstøy
- Konsistent med fargene i appen

## 9) Versjonslogg
- v0.1 — 2025-10-23 — Første generering. Seed: `2025_103`. Verktøy: <fyll inn>. Valgt variant: <A/B/C>. Eksporter: ikon1024, splash1000, svg.
- v0.2 — … (skriv her når du endrer seed/farger/form)
