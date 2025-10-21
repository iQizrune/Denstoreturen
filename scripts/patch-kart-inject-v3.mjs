import fs from "fs";
const f = process.argv[2] || "app/kart.tsx";
let s = fs.readFileSync(f, "utf8");

// a) robust INJECT_LEGS (setter både ROUTE_LEGS og route_legs, logger tre tidspunkter)
const injBody =
  '(function(){\n' +
  '  try {\n' +
  '    var __legs = ' +
  '${JSON.stringify((ROUTE_LEGS_JSON as any).ROUTE_LEGS ?? ROUTE_LEGS_JSON ?? [])}' +
  ';\n' +
  '    window.ROUTE_LEGS = Array.isArray(__legs) ? __legs : [];\n' +
  '    window.route_legs  = window.ROUTE_LEGS;\n' +
  '    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage("legs:set:" + window.ROUTE_LEGS.length);\n' +
  '    document.addEventListener("DOMContentLoaded", function(){\n' +
  '      window.ROUTE_LEGS = Array.isArray(__legs) ? __legs : window.ROUTE_LEGS || [];\n' +
  '      window.route_legs = window.ROUTE_LEGS;\n' +
  '      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage("legs:dom:" + window.ROUTE_LEGS.length);\n' +
  '    });\n' +
  '    setTimeout(function(){\n' +
  '      window.ROUTE_LEGS = Array.isArray(__legs) ? __legs : window.ROUTE_LEGS || [];\n' +
  '      window.route_legs = window.ROUTE_LEGS;\n' +
  '      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage("legs:retry:" + window.ROUTE_LEGS.length);\n' +
  '    }, 300);\n' +
  '  } catch (e) {\n' +
  '    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage("inject_error:" + (e && e.message));\n' +
  '  }\n' +
  '})(); true;';

if (s.includes("const INJECT_LEGS =")) {
  s = s.replace(/const INJECT_LEGS\s*=\s*`[\s\S]*?`;/, 'const INJECT_LEGS = `'+injBody+'`;');
} else {
  const importBlock = /^(?:\s*import[\s\S]*?;\s*\r?\n)+/m;
  const m = s.match(importBlock);
  const injLine = 'const INJECT_LEGS = `'+injBody+'`;\n\n';
  s = m ? s.slice(0, m.index + m[0].length) + injLine + s.slice(m.index + m[0].length) : injLine + s;
}

// b) Finn første <WebView ...> og legg til props PRESIST (én gang, ingen duplikat)
const idx = s.indexOf("<WebView");
if (idx === -1) {
  console.error("Fant ikke <WebView ...> i", f);
  process.exit(1);
}

// Først: hent frem til slutten av åpnings-taggen (til første '>')
const endTag = s.indexOf(">", idx);
if (endTag === -1) {
  console.error("Fant ikke slutt på <WebView ...>-tag i", f);
  process.exit(1);
}

const opening = s.slice(idx, endTag); // uten ">"
let newOpening = opening;

// Legg kun til injectedJavaScriptBeforeContentLoaded hvis den ikke finnes
if (!/\binjectedJavaScriptBeforeContentLoaded=/.test(opening)) {
  newOpening += ' injectedJavaScriptBeforeContentLoaded={INJECT_LEGS}';
}

// Legg kun til onMessage hvis den ikke finnes
if (!/\bonMessage=/.test(opening)) {
  newOpening += ' onMessage={(e)=>{ try { console.log("[WebView]", e?.nativeEvent?.data); } catch(_) {} }}';
}

// Ikke legg til injectedJavaScript (after) i denne runden, for å holde endringen minimal/sikker

// Bytt ut kun åpningsdelen
s = s.slice(0, idx) + newOpening + s.slice(endTag);

fs.writeFileSync(f, s);
console.log("Oppdatert:", f, "✅");
