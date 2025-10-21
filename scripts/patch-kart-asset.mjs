import fs from "fs";

const f = process.argv[2] || "app/kart.tsx";
let s = fs.readFileSync(f, "utf8");

// 1) Importer Asset fra expo-asset hvis mangler
if (!/from\s+["']expo-asset["']/.test(s)) {
  s = s.replace(/^(import[\s\S]*?;\s*\r?\n)/, m => m + 'import { Asset } from "expo-asset";\n');
}

// 2) Sørg for at useState/useEffect er tilgjengelig
const hasReactStar = /import\s+\*\s+as\s+React\s+from\s+["']react["'];?/.test(s);
const hasHooksImport = /import\s*\{\s*[^}]*use(State|Effect)[^}]*\}\s*from\s*["']react["']/.test(s);
if (!hasHooksImport) {
  s = s.replace(/^(import[\s\S]*?;\s*\r?\n)/, m => m + 'import { useState, useEffect } from "react";\n');
}

// 3) Legg inn state + effekt for å resolve lokal HTML via expo-asset
if (!/const\s+\[\s*htmlUri\s*,\s*setHtmlUri\s*\]/.test(s)) {
  // finn starten av første komponent-funksjon
  const compStart = s.search(/export\s+default\s+function\b|function\s+\w+\s*\(/);
  if (compStart >= 0) {
    const braceIdx = s.indexOf("{", compStart);
    if (braceIdx >= 0) {
      const inject = `
  const [htmlUri, setHtmlUri] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const mod = require("../assets/route/route-map.v3.html");
        const asset = Asset.fromModule(mod);
        await asset.downloadAsync();
        setHtmlUri(asset.uri);
      } catch (e) {
        console.warn("[kart] Klarte ikke laste HTML", e && e.message);
      }
    })();
  }, []);
`;
      s = s.slice(0, braceIdx + 1) + inject + s.slice(braceIdx + 1);
    }
  }
}

// 4) Return-guard: ikke rendre WebView før htmlUri er klar
if (!/if\s*\(!htmlUri\)\s*return\b/.test(s)) {
  s = s.replace(/\breturn\s*\(/, 'if (!htmlUri) return null;\n  return (');
}

// 5) Sikre at <WebView ...> bruker source={{ uri: htmlUri }} + whitelist + file access
const idx = s.indexOf("<WebView");
if (idx !== -1) {
  const endTag = s.indexOf(">", idx);
  if (endTag !== -1) {
    const opening = s.slice(idx, endTag);
    let newOpening = opening;

    if (!/\bsource=/.test(opening)) {
      newOpening += ' source={{ uri: htmlUri }}';
    }
    if (!/\boriginWhitelist=/.test(opening)) {
      newOpening += ' originWhitelist={["*"]}';
    }
    if (!/\ballowFileAccess=/.test(opening)) {
      newOpening += ' allowFileAccess={true}';
    }
    if (!/\ballowUniversalAccessFromFileURLs=/.test(opening)) {
      newOpening += ' allowUniversalAccessFromFileURLs={true}';
    }

    s = s.slice(0, idx) + newOpening + s.slice(endTag);
  }
}

fs.writeFileSync(f, s);
console.log("Oppdatert:", f, "✅");
