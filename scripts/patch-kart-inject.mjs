import fs from "fs";

const f = process.argv[2] || "app/kart.tsx";
let s = fs.readFileSync(f, "utf8");

if (!s.includes("const INJECT_LEGS =")) {
  const inj =
    'const INJECT_LEGS = `(function(){\n' +
    '  try {\n' +
    '    window.ROUTE_LEGS = ' +
    '${JSON.stringify((ROUTE_LEGS_JSON as any).ROUTE_LEGS ?? ROUTE_LEGS_JSON ?? [])}' +
    ';\n' +
    '    if (window.ReactNativeWebView && Array.isArray(window.ROUTE_LEGS)) {\n' +
    '      window.ReactNativeWebView.postMessage("legs:" + window.ROUTE_LEGS.length);\n' +
    '    } else if (window.ReactNativeWebView) {\n' +
    '      window.ReactNativeWebView.postMessage("legs:?");\n' +
    '    }\n' +
    '  } catch (e) {\n' +
    '    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage("inject_error:" + (e && e.message));\n' +
    '  }\n' +
    '})(); true;`;\n\n';

  const importBlock = /^(?:\s*import[\s\S]*?;\s*\r?\n)+/m;
  const m = s.match(importBlock);
  if (m) {
    const end = m.index + m[0].length;
    s = s.slice(0, end) + inj + s.slice(end);
  } else {
    s = inj + s;
  }
}

const hasInjectedBefore = /<WebView[^>]*\binjectedJavaScriptBeforeContentLoaded=/.test(s);
const hasOnMessage      = /<WebView[^>]*\bonMessage=/.test(s);

const injProp = 'injectedJavaScriptBeforeContentLoaded={INJECT_LEGS}';
const onMsgProp = 'onMessage={(e)=>{ try { console.log("[WebView]", e?.nativeEvent?.data); } catch(_) {} }}';

if (!hasInjectedBefore) {
  s = s.replace(/<WebView\b/, `<WebView ${injProp} `);
}

if (!hasOnMessage) {
  s = s.replace(/<WebView\b/, `<WebView ${onMsgProp} `);
}

fs.writeFileSync(f, s);
console.log("Oppdatert:", f,
  hasInjectedBefore ? "(hadde injectedJavaScriptBeforeContentLoaded)" : "(la til injectedJavaScriptBeforeContentLoaded)",
  hasOnMessage ? "(hadde onMessage)" : "(la til onMessage)"
);
