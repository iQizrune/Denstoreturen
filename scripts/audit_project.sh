#!/usr/bin/env bash
# audit_project.sh — lager en prosjekt-oversikt og finner opplagte arkivkandidater
# Kjores fra prosjektroten (samme mappe som package.json).
# Output legges i ./audits/

set -euo pipefail

OUT="audits"
mkdir -p "$OUT"

timestamp() { date +"%Y-%m-%d_%H%M%S"; }
TS="$(timestamp)"

echo "🔎 Lager filinventar ..."
# Full liste (med størrelse og endringsdato)
# Ekskluder node_modules og .expo-cache
find . \
  -path "./node_modules" -prune -o \
  -path "./.expo" -prune -o \
  -path "./.expo-shared" -prune -o \
  -path "./.git" -prune -o \
  -print0 | xargs -0 ls -ldT > "$OUT/file-inventory_$TS.txt" || true

# En ryddigere CSV med bare "typer vi bryr oss om"
echo "path,bytes,mtime" > "$OUT/file-inventory_$TS.csv"
find . -type f \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.html" -o -name "*.css" -o -name "*.md" \) \
  -not -path "./node_modules/*" -not -path "./.expo/*" -not -path "./.git/*" \
  -print0 | while IFS= read -r -d '' f; do
    bytes=$(wc -c < "$f" | tr -d ' ')
    mtime=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$f" 2>/dev/null || stat -c "%y" "$f" 2>/dev/null || echo "")
    echo "$f,$bytes,$mtime" >> "$OUT/file-inventory_$TS.csv"
  done

echo "🧠 Finner åpenbare arkivkandidater ..."
suspects="$OUT/suspects_$TS.txt"
: > "$suspects"

# Kandidater: html-kart, *_archive, _archive, temp, backup, gamle map-komponenter, duplikate libs
grep -E "/assets/route/route-map\.v[0-9]+\.html$" "$OUT/file-inventory_$TS.csv" | cut -d, -f1 >> "$suspects" || true
find . -type d \( -name "_app_archive" -o -name "_archive" -o -name "archive" -o -name "arkiv" \) -print >> "$suspects" 2>/dev/null || true
find . -type f \( -name "*.bak_*" -o -name "*.tmp" -o -name "*.orig" -o -name "*~" \) -print >> "$suspects" 2>/dev/null || true

# Gamle map-komponenter
find components -maxdepth 2 -type f \( -name "MapView.tsx" -o -name "MapViewSvg_old.tsx" -o -name "MapViewDebug.tsx" \) -print >> "$suspects" 2>/dev/null || true

# Duplikate progressBus
if [ -f "src/lib/progressBus.ts" ]; then
  find app -type f -name "progressBus.ts" -print >> "$suspects" 2>/dev/null || true
fi

# Gamle rute-datafiler som ofte dupliserer dagens kilde
find src -type f \( -name "routeNodes.ts" -o -name "routeGlobals.js" \) -print >> "$suspects" 2>/dev/null || true

# Binære/feilende poster-komponenter
find components -type f -name "UseHelpPoster.tsx" -print >> "$suspects" 2>/dev/null || true

# Diverse støy
find . -type f \
  \( -name ".DS_Store" -o -name "Thumbs.db" -o -name "Icon?" -o -name "*.log" -o -name "*.swp" \) -print >> "$suspects" 2>/dev/null || true

sort -u "$suspects" -o "$suspects"

echo "🧩 Prøver å finne potensielle 'orphan'-filer (ikke referert noe sted) ..."
# En enkel RG-basert orphan-sjekk for vanlige mapper
orphan_out="$OUT/orphans_$TS.txt"
: > "$orphan_out"

scan_dir() {
  local dir="$1"
  [ -d "$dir" ] || return 0
  # se etter .ts/.tsx-filer som ikke blir referert i noen andre filer (grov sjekk)
  while IFS= read -r -d '' f; do
    base="$(basename "$f")"
    # hopp over indekser og typefiler
    if [[ "$base" =~ ^index\.(ts|tsx|js)$ ]] || [[ "$base" =~ ^types?\.(ts|tsx)$ ]]; then
      continue
    fi
    # grep etter filnavn uten utvidelse
    stem="${base%.*}"
    if ! rg -n --hidden --glob '!node_modules' --glob '!.git' --glob '!.expo' --glob '!audits' "$stem" . >/dev/null 2>&1; then
      echo "$f" >> "$orphan_out"
    fi
  done < <(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) -print0)
}

scan_dir "components"
scan_dir "src"
scan_dir "app"

sort -u "$orphan_out" -o "$orphan_out"

echo "✅ Ferdig! Se rapportene i $OUT/:"
echo "  - file-inventory_$TS.csv"
echo "  - suspects_$TS.txt"
echo "  - orphans_$TS.txt"
