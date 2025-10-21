import * as React from "react";
import { onMeters } from "@/src/lib/progressBus";
import { indexFromMeters } from "@/src/route/stopsFromData";

export function useCurrentStopIndex(initialMeters = 0) {
  const [meters, setMeters] = React.useState<number>(initialMeters);
  React.useEffect(() => {
    const off = onMeters(({ meters }) => setMeters(meters));
    return off;
  }, []);
  return indexFromMeters(meters);
}
