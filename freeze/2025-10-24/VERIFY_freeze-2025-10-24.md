# ✅ Post-freeze verifisering – 2025-10-24

## 🧩 Hensikt
Etter en freeze skal denne sjekklisten brukes til å bekrefte at prosjektet
bygger, starter og viser korrekt funksjonalitet uten feil.

## 🔍 1. Kjør bygg- og typesjekk

Begge skal returnere **OK** uten feilmeldinger.

## 🚀 2. Start appen lokalt (Expo)

Sjekk at:
- Introflyten (Splash → Info1 → Profil → Info2 → Pre-etappe) fungerer
- Profilvalg lagres og vises riktig
- Kartet viser hele ruten korrekt
- Spørsmålssekvens følger riktig kategori-mønster

## 📱 3. Test gameplay
- Svar på minst 20 spørsmål
- Verifiser at **bonus**, **reveal**, **trick** og **lightning** dukker etter plan
- Bekreft at meter-telling fungerer og publiseres i HUD
- Bekreft at 'Runde ferdig' vises og ingen svart skjerm oppstår

## 💾 4. Verifiser lagring
- Avataren og profilinfo hentes korrekt etter app-restart
- Ingen duplikate AsyncStorage-nøkler (sjekk via `adb shell run-as` om ønskelig)

## 🧹 5. Rydd opp før ny freeze


Når alt er grønt → lag ny branch fra denne frysen for neste utviklingssyklus.
