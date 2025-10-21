// app/kart.tsx
import React, { useMemo, useRef } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { Asset } from "expo-asset";

// NB: Metro gir oss selve objektet når resolveJsonModule=true
// Ligger på: assets/route/route-legs.json
// @ts-ignore
import ROUTE_LEGS_JSON from "../assets/route/route-legs.json";

export default function KartScreen() {
  const ref = useRef<WebView>(null);

  const htmlUri = useMemo(() => {
    const htmlAsset = Asset.fromModule(require("../assets/route/route-map.v3.html"));
    if (!htmlAsset.downloaded) htmlAsset.downloadAsync?.();
    return htmlAsset.localUri ?? htmlAsset.uri;
  }, []);

  // Gjør dataene tilgjengelige globalt i WebView FØR scripts kjører:
  const injectedBefore = `
    (function(){
      try {
       window.ROUTE_LEGS = ${JSON.stringify((ROUTE_LEGS_JSON as any).ROUTE_LEGS ?? ROUTE_LEGS_JSON ?? [])};
      } catch (e) {}
    })();
    true;
  `;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        allowFileAccess
        allowUniversalAccessFromFileURLs
        source={{ uri: htmlUri }}
        injectedJavaScriptBeforeContentLoaded={injectedBefore}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg?.type === "routeMapReady") {
              // Demo: velg første etappe og sett blå markør litt ut i etappen
              ref.current?.postMessage(JSON.stringify({ type: "setActiveLeg", leg: 0 }));
              ref.current?.postMessage(JSON.stringify({ type: "setProgress", leg: 0, pointIdx: 100 }));
            }
          } catch {}
        }}
      />
    </View>
  );
}
