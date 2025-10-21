import fs from "fs";
const f = process.argv[2] || "app/kart.tsx";
let s = fs.readFileSync(f, "utf8");

// 1) Sørg for at INJECT_LEGS finnes, og sett robust innhold:
const injBody =
  '(function(){\n' +
  '  try {\n' +
  '    var __legs = ' +
  '${JSON.stringify((ROUTE_LEGS_JSON as any).ROUTE_LEGS ?? ROUTE_LEGS_JSON ?? [])}' +
  ';\n' +
  '    // Sett begge navn som noen HTML-varianter forventer\n' +
  '    window.ROUTE_LEGS = Array.isArray(__legs) ? __legs : [];\n' +
  '    window.route_legs  = window.ROUTE_LEGS;\n' +
  '    // Rapporter umiddelbart\n' +
  '    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage("legs:set:" + window.ROUTE_LEGS.length);\n' +
  '    // Etter DOMContentLoaded – i tilfelle HTML leser sent\n' +
  '    document.addEventListener("DOMContentLoaded", function(){\n' +
  '      // re-assert i tilfelle noe har overskrevet\n' +
  '      window.ROUTE_LEGS = Array.isArray(__legs) ? __legs : window.ROUTE_LEGS || [];\n' +
  '      window.route_legs = window.ROUTE_LEGS;\n' +
  '      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage("legs:dom:" + window.ROUTE_LEGS.length);\n' +
  '    });\n' +
  '    // Og en liten retry litt senere\n' +
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
  if (m) {
    const end = m.index + m[0].length;
    s = s.slice(0,end) + injLine + s.slice(end);
  } else {
    s = injLine + s;
  }
}

// 2) Sørg for at <WebView> har både before og after, samt onMessage-logg
const hasBefore = /<WebView[^>]*\binjectedJavaScriptBeforeContentLoaded=/.test(s);
const hasAfter  = /<WebView[^>]*\binjectedJavaScript=/.test(s);
const hasMsg    = /<WebView[^>]*\bonMessage=/.test(s);

if (!hasBefore) s = s.replace(/<WebView\b/, '<WebView injectedJavaScriptBeforeContentLoaded={INJECT_LEGS} ');
if (!hasAfter)  s = s.replace(/<WebView\b/, '<WebView injectedJavaScript={INJECT_LEGS} ');
if (!hasMsg)    s = s.replace(/<WebView\b/, '<WebView onMessage={(e)=>{ try { console.log("[WebView]", e?.nativeEvent?.data); } catch(_) {} }} ');

fs.writeFileSync(f, s);
console.log("Oppdatert:", f,
  hasBefore ? "(hadde before)" : "(la til before)",
  hasAfter  ? "(hadde after)"  : "(la til after)",
  hasMsg    ? "(hadde onMessage)" : "(la til onMessage)"
);
