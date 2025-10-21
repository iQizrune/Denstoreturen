// src/hooks/useArrivedStop.ts
// Lytter på meter-progresjon og publiserer "arrival" når vi krysser grensa til neste stopp.
// - Kaller valgfri onArrive-callback lokalt
// - Publiserer globalt via arrivalBus slik at appen (root/_layout) kan reagere uansett hvilken skjerm vi står på.

import * as React from "react";
import { onMeters } from "@/src/lib/progressBus";
import { STOP_CUM_METERS, STOP_NAMES } from "@/src/data/stops";
import { indexFromMeters } from "@/src/route/stopsFromData";
import { publishArrival } from "@/src/lib/arrivalBus";

export type ArriveLocalPayload = {
  index: number;      // stopp-indeks 0..N-1 (ankommet stopp)
  id: string;         // STOP_NAMES[index]
  meters: number;     // total meter ved ankomst
  prevIndex: number;  // forrige "ankommet" stopp-indeks
};

/**
 * useArrivedStop:
 *  - Lytter på onMeters (progressBus)
 *  - Når spiller passerer terskelen for nytt stopp (STOP_CUM_METERS), trigges ankomst
 *  - Kaller onArrive (lokalt), og publiserer arrival globalt via arrivalBus
 */
export function useArrivedStop(onArrive?: (p: ArriveLocalPayload) => void) {
  const prevIdxRef = React.useRef<number>(0);
  const lastPublishedRef = React.useRef<number>(-1);

  React.useEffect(() => {
    const off = onMeters(({ meters }) => {
      // Finn største i der STOP_CUM_METERS[i] <= meters
      const cur = indexFromMeters(meters);
      const prev = prevIdxRef.current;

      // Kryssing av terskel = ankomst nytt stopp
      if (cur > prev) {
        const id = (STOP_NAMES[cur] || "").toString();

        // Lokalt callback (valgfritt)
        onArrive?.({ index: cur, id, meters, prevIndex: prev });

        // Global publisering (kun én gang per stopp-indeks)
        if (lastPublishedRef.current !== cur) {
          publishArrival({ index: cur, id, meters });
          lastPublishedRef.current = cur;
        }
      }

      // Oppdater "forrige"-indeks (slik at vi ser kryssing ved neste event)
      prevIdxRef.current = cur;
    });

    return off;
  }, [onArrive]);
}
