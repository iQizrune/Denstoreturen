# TODO – Statistikkfase 2 (Mine Ting)

Dette dokumentet beskriver neste steg i utviklingen av statistikksystemet og Mine Ting-panelet.  
Oppdatert: **2025-10-29**

---

## 🎯 Hovedmål
Utvide statistikken slik at spilleren kan se sin samlede innsats over tid:
- Akkumulert spilletid (effektiv)
- Riktig/feil totalt (uten by-quiz)
- Antall soft restarts (kommer senere)
- Tilpasning per profil og mulighet for full nullstilling

---

## 🔧 Logikk & Datainnsamling

- [ ] **Bekrefte “recordAnswer” dekning**  
  `recordAnswer(isCorrect)` kalles i `src/partials/PlayingPanels_pauseable.tsx` for alle vanlige spørsmålsbanker.  
  → Sjekk at **StopModule** (by-quiz) *ikke* kaller denne, siden by-quiz skal ekskluderes fra totalstatistikk.

- [ ] **Soft restarts (forberedt)**  
  Når liv/fortsett-mekanikk introduseres: kall `incrementSoftRestarts()` ved hver ny start etter tap.

- [ ] **Edge-cases for tid**  
  Vi bruker:
  - `debounce STOP = 800 ms`
  - `unmount grace = 1500 ms`  
  Disse kan justeres etter faktisk spillflyt.

---

## 💾 Persist & Nøkler

- [ ] **Profil-basert nøkkel**  
  Når profil finnes, endre lagring til:
  ```ts
  installStatsPersistence(profile?.id)
  installBagPersistence(profile?.id)
  ```
  Lagringsnøklene blir da `stats:<profileId>` og `bag:<profileId>`.

- [ ] **Full reset ved ny profil**  
  Lag `components/bag/hardReset.ts` med:
  ```ts
  hardResetAll() {
    clearBag();
    clearStats();
    AsyncStorage.removeItem("stats:*");
    AsyncStorage.removeItem("bag:*");
  }
  ```
  → Knyttes til “Start helt på nytt” senere.

---

## 🧩 UI (Mine Ting)

- [ ] **Vis effektiv + akkumulert spilletid**  
  - `playSec` → live-tid (pågående økt)  
  - `stat.totalPlaySeconds` → akkumulert fra tidligere økter  
  → vis begge i `MineTingPanel.tsx`

- [ ] **Knapp: Nullstill statistikk**  
  - Knyt til `hardResetAll()`  
  - Bekreftelsesmodal (“Er du sikker?”)

- [ ] **Tilpasning små skjermer**  
  - Bruk `numberOfLines` og `ellipsizeMode` på lange tall  
  - Sørg for balansert spacing med `gap` / `flexWrap`

---

## 🧹 Kvalitet & Rydding

- [ ] Fjern midlertidige logger:
  ```
  [stats/live], [play/session], [panel] tick, modul-id
  ```
  eller pakk dem i:
  ```ts
  if (__DEV__) console.log(...)
  ```

- [ ] Alias-konsistens:  
  `@/components/bag/*` overalt (unngå duplikater fra relative stier)

- [ ] Enkle tester for `statsStore`:
  - `startSession()` → tid øker  
  - `stopSession()` → tid akkumuleres  
  - `hydrateFromSnapshot()` → bevarer pågående økt

---

## 📘 Dokumentasjon

- [ ] Oppdater `PROJECT_SUMMARY.md` eller `OPPSUMMERING.md` med:
  - `hydrateFromSnapshot`-fix
  - Debounce + unmount-grace
  - Alias-konsistens
  - By-quiz ekskludert fra statistikk

---

## 🧭 Anbefalt commit-sekvens

```bash
npx tsc --noEmit
npm run guard
git add -A
git commit -m "feat(stats): profilnøkler, live+akk tid i Mine ting, debounce/grace dokumentert; ryddet logger"
git push
```

---

### Status 2025-10-29
✅ Klokka starter og stopper korrekt i spørsmålsmodus  
✅ Persist fungerer  
✅ `recordAnswer` registrerer riktig/feil  
⏳ Neste steg: profil-nøkler + reset-mekanikk
