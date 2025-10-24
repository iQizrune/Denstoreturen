# 🧊 Freeze-mapper – struktur og praksis

Hver mappe under **freeze/** representerer et stabilt punkt i utviklingen.
Eksempel: `freeze/2025-10-24/` markerer en ferdig testet versjon av appen.

## 📦 Innhold per freeze
Hver freeze-mappe skal inneholde:

1. `CHECKLIST_*.md` – kort oppsummering av hva som ble oppnådd.
2. Valgfritt: skjermbilder, testnotater, demo-lenker.
3. Ingen kodekopier – alle filer skal ligge i repoets hovedstruktur.

## 🧱 Hvordan lage ny freeze


## 🔁 Hvordan gjenopprette en freeze


## 🪶 Anbefalt navnestandard
- **freeze/YYYY-MM-DD/** → stabilt bygg.
- **restore/freeze-YYYY-MM-DD** → midlertidig gjenopprettet gren.
- **dev/YYYY-MM-DD-[feature]** → ny utviklingsgren etter freeze.

## 🧭 Hensikt
Freeze-mappene sikrer at vi alltid kan spore og gjenåpne stabile versjoner,
uten at aktiv utvikling mister historikk eller sammenheng.
