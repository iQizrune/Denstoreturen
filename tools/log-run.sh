#!/usr/bin/env bash
set -euo pipefail
ROOT="$(pwd)"
STAMP="$(date +%F_%H%M)"
OUT="tilnychat/RUN_LOG_${STAMP}.txt"
mkdir -p tilnychat
echo "# Run-logg $(date)" | tee "$OUT"
echo "[log] root: $ROOT" | tee -a "$OUT"
echo "[log] node: $(node -v)" | tee -a "$OUT"
echo "[log] npm : $(npm -v)" | tee -a "$OUT"
npm run -s guard 2>&1 | tee -a "$OUT" || true
PORT=8081
LIMIT=8090
while lsof -i :"$PORT" -n -P >/dev/null 2>&1; do
  PORT=$((PORT+1))
  if [ "$PORT" -gt "$LIMIT" ]; then echo "[log] ingen ledig port 8081-8090" | tee -a "$OUT"; exit 1; fi
done
echo "[log] starting dev server on port $PORT" | tee -a "$OUT"
CI=1 npx expo start --port "$PORT" 2>&1 | tee -a "$OUT"
exit 0
