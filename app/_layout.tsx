// app/_layout.tsx
import * as React from "react";
import { Slot, useRouter } from "expo-router";
import { onArrival } from "@/src/lib/arrivalBus";

/**
 * RootLayout:
 *  - Lytter globalt på arrivals (fra useArrivedStop -> arrivalBus)
 *  - Ved arrival navigerer vi til /stop (StopModule-skjermen)
 */
export default function RootLayout() {
  const router = useRouter();

  React.useEffect(() => {
    const off = onArrival(({ id }) => {
      // Naviger til stoppskjerm. Vi sender med "name" (stopp-id)
      // Stop-skjermen kan hente den via useLocalSearchParams() om ønskelig.
      router.push({ pathname: "/stop", params: { name: id } });
    });
    return off;
  }, [router]);

  // Slot = plassholder for de nested rutene (app/**)
  return <Slot />;
}
