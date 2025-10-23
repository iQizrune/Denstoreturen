#!/bin/bash
# setup_clean.sh - Oppretter Expo Router/src-struktur og fjerner redundante filer.

# Sikrer at vi stopper ved feil
set -e

echo "--- 1. OPPRETTER MAPPESSTRUKTUR ---"
mkdir -p app src/{banks,engine,hooks,lib,partials,state,storage,types,util,data} components/{posters,map,bag,ui} tilnychat

echo "--- 2. OPPRYDDING: IDENTIFISERER & SLETTER REDUNDANTE FILER ---"
# Sletter duplikate/foreldede banks-adaptere (beholder kun de essensielle)
rm -f src/banks/{adapter.ts,cityAdapter.ts,local.ts,index.ts} || true
rm -f src/banks/StopQuizAdapter.ts src/banks/StopPanel.tsx || true
# Sletter foreldede/duplikate UI-komponenter og state
rm -f components/StopPanel.tsx || true
rm -f src/storage/index.ts || true
rm -f src/stops/lillehammer.ts || true

# --- 3. FLYTTING: PLASSERER FILENE I NY ARKITEKTUR ---

# A) Ruting og Skjermer (app/)
echo "Flytter Expo ruter til app/..."
mv play.tsx app/ 2>/dev/null
mv _layout.tsx app/ 2>/dev/null
mv stop.tsx app/ 2>/dev/null
mv start.tsx app/ 2>/dev/null
mv profile.tsx app/ 2>/dev/null
mv results.tsx app/ 2>/dev/null
mv kart.tsx app/ 2>/dev/null

# B) Kjerne-state (src/state/)
echo "Flytter state-moduler til src/state/..."
mv run.ts src/state/ 2>/dev/null
mv route.ts src/state/ 2>/dev/null
# Beholder profile.ts i src/state/ (in-memory) og flytter den persistente til src/storage/
mv src/state/profile.ts src/state/ 2>/dev/null

# C) Persistent lagring (src/storage/)
echo "Flytter persistent lagring til src/storage/..."
mv src/storage/profile.ts src/storage/ 2>/dev/null

# D) Hooks (src/hooks/)
echo "Flytter hooks til src/hooks/..."
mv useArrivedStop.ts src/hooks/ 2>/dev/null
mv useCurrentStopIndex.ts src/hooks/ 2>/dev/null

# E) Event Busser (src/lib/)
echo "Flytter Event Buses til src/lib/..."
mv progressBus.ts src/lib/ 2>/dev/null
mv arrivalBus.ts src/lib/ 2>/dev/null
mv stageBus.ts src/lib/ 2>/dev/null
mv stageQueue.ts src/lib/ 2>/dev/null
mv kartBus.ts src/lib/ 2>/dev/null

# F) Engine/Dirigent (src/engine/)
echo "Flytter Dirigent-logikk til src/engine/..."
mv conductor.ts src/engine/ 2>/dev/null
mv src/engine/index.ts src/engine/ 2>/dev/null
mv src/engine/types.ts src/engine/types.ts 2>/dev/null

# G) Quiz Banks (src/banks/)
echo "Flytter spørsmålsbanker til src/banks/..."
mv buildQuizPool.ts src/banks/ 2>/dev/null
mv core.ts src/banks/ 2>/dev/null
mv bonus.ts src/banks/ 2>/dev/null
mv extraLife.ts src/banks/ 2>/dev/null
mv flags.ts src/banks/ 2>/dev/null
mv flagsAdapter.ts src/banks/ 2>/dev/null
mv flagsAssets.ts src/banks/ 2>/dev/null
mv byer.ts src/banks/ 2>/dev/null
mv cityAdapter.ts src/banks/ 2>/dev/null 
mv getStopQuizByer.ts src/banks/ 2>/dev/null
mv stopQuizAdapter.ts src/banks/ 2>/dev/null
mv lightning.ts src/banks/ 2>/dev/null
mv reveal.ts src/banks/ 2>/dev/null
mv revealAssets.ts src/banks/ 2>/dev/null
mv sequence.ts src/banks/ 2>/dev/null
mv trick.ts src/banks/ 2>/dev/null

# H) Utils og Typer (src/util/ & src/types/)
echo "Flytter felles utils og typer..."
mv util.ts src/util/ 2>/dev/null
mv types.ts src/types/ 2>/dev/null
mv global.d.ts src/types/ 2>/dev/null

# I) Partials og Komponenter
echo "Flytter UI-komponenter og partials..."
mv StopModule.tsx src/partials/ 2>/dev/null
mv PlayingPanels.tsx src/partials/ 2>/dev/null
mv TimeBar.tsx src/partials/ 2>/dev/null 
mv ArrivalPoster.tsx components/posters/ 2>/dev/null
mv StagePoster.tsx components/posters/ 2>/dev/null
mv IntroPoster.tsx components/posters/ 2>/dev/null
mv ThemedText.tsx components/ui/ 2>/dev/null
mv ThemedView.tsx components/ui/ 2>/dev/null
mv ParallaxScrollView.tsx components/ui/ 2>/dev/null
mv HapticTab.tsx components/ui/ 2>/dev/null
mv StopPanel.tsx components/ui/ 2>/dev/null # Flyttes til ui for nå

# J) Konfigurasjon og Dokumentasjon
echo "Flytter konfigurasjon og dokumentasjon..."
mv Appbeskrivelse.md tilnychat/ 2>/dev/null
mv Appbeskrivelse_teknisk.md tilnychat/ 2>/dev/null
mv EldreOPPSUMMERING.md tilnychat/ 2>/dev/null
mv OPPSUMMERING_CHAT_2025-10-16_1905.md tilnychat/ 2>/dev/null
mv OPPSUMMERING.md tilnychat/ 2>/dev/null
mv SAMARBEID.md tilnychat/ 2>/dev/null
mv *.json ./ 2>/dev/null 
mv *.js ./ 2>/dev/null   
mv *.mjs ./ 2>/dev/null
mv *.cjs ./ 2>/dev/null
mv *.ts ./ 2>/dev/null

echo "--- FILFLYTNING FULLFØRT ---"
