#!/usr/bin/env bash
set -e
npx tsc --noEmit
rg -n "takePendingStageStart\\(" app/play.tsx >/dev/null || { echo "Mangler takePendingStageStart i app/play.tsx"; exit 1; }
rg -n "useEffect\\([^)]*\\[\\]" app/play.tsx | rg -n "takePendingStageStart" >/dev/null || { echo "Mangler mount-sjekk av stageQueue i app/play.tsx"; exit 1; }
rg -n "useEffect\\([^)]*\\[stopVisible\\]\\)" app/play.tsx | rg -n "takePendingStageStart" >/dev/null || { echo "Mangler stopVisible-sjekk av stageQueue i app/play.tsx"; exit 1; }
