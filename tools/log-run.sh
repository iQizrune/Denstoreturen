#!/usr/bin/env bash
set -euo pipefail
ROOT="$(pwd)"
STAMP="$(date +%F_%H%M)"
OUT="tilnychat/RUN_LOG_${STAMP}.txt"
mkdir -p "tilnychat"
echo "# Run-logg $(date)" | tee "$OUT"
echo "[log] root: $ROOT" | tee -a "$OUT"
echo "[log] node: $(node -v)" | tee -a "$OUT"
echo "[log] npm : $(npm -v)" | tee -a "$OUT"
npm run -s guard 2>&1 | tee -a "$OUT" || true
echo "[log] starting dev server…" | tee -a "$OUT"
npm start 2>&1 | tee -a "$OUT"
exit 0
