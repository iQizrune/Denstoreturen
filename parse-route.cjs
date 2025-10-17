const fs = require("fs");
const vm = require("vm");

const arg = process.argv[2];
const candidates = [arg, "route-globals.js", "routeData.ts", "routeData.js", "routeData.mjs", "routes.ts", "routes.js"].filter(Boolean);

let inFile = null;
for (const f of candidates) { if (f && fs.existsSync(f)) { inFile = f; break; } }
if (!inFile) {
  for (const f of fs.readdirSync(".")) {
    if (!/\.(ts|jsx?|mjs|cjs)$/.test(f)) continue;
    const s = fs.readFileSync(f, "utf8");
    if (s.includes("fromName") && s.includes("path")) { inFile = f; break; }
  }
}
if (!inFile) { console.error("Fant ingen rutedata-fil her. Legg filen i denne mappen og kjør igjen."); process.exit(1); }

function encodeSigned(n) {
  n = n << 1;
  if (n < 0) n = ~n;
  let out = "";
  while (n >= 0x20) {
    out += String.fromCharCode((0x20 | (n & 0x1f)) + 63);
    n >>= 5;
  }
  out += String.fromCharCode(n + 63);
  return out;
}
function encodePolyline(latlngs) {
  let lastLat = 0, lastLng = 0, result = "";
  for (const pair of latlngs) {
    const lat = pair[0], lng = pair[1];
    const ilat = Math.round(lat * 1e5);
    const ilng = Math.round(lng * 1e5);
    const dlat = ilat - lastLat;
    const dlng = ilng - lastLng;
    result += encodeSigned(dlat) + encodeSigned(dlng);
    lastLat = ilat; lastLng = ilng;
  }
  return result;
}

let code = fs.readFileSync(inFile, "utf8");
let transformed = code;
transformed = transformed.replace(/export\s+default\s+/, "globalThis.ROUTES = ");
transformed = transformed.replace(/export\s+(const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*/, "globalThis.ROUTES = ");
transformed = transformed.replace(/\s+as\s+const/g, "");
transformed = transformed.replace(/module\.exports\s*=\s*/, "globalThis.ROUTES = ");
if (!/globalThis\.ROUTES\s*=/.test(transformed)) {
  if (/^\s*\[/.test(transformed.trim())) {
    transformed = "globalThis.ROUTES = " + transformed;
  }
}

const sandbox = { console, globalThis: {} };
vm.createContext(sandbox);
try {
  vm.runInContext(transformed, sandbox, { filename: inFile, timeout: 10000 });
} catch (e) {
  console.error("Klarte ikke å kjøre rutedata-filen:", inFile);
  console.error(String(e));
  process.exit(2);
}

function looksLikeRouteArray(val) {
  if (!Array.isArray(val) || val.length === 0) return false;
  const s = val[0];
  return s && typeof s === "object" && "fromName" in s && "toName" in s && Array.isArray(s.path);
}

let routes = null;
if (looksLikeRouteArray(sandbox.globalThis.ROUTES)) routes = sandbox.globalThis.ROUTES;
if (!routes) {
  for (const k of Object.getOwnPropertyNames(sandbox)) {
    const v = sandbox[k];
    if (looksLikeRouteArray(v)) { routes = v; break; }
  }
}
if (!routes) {
  console.error("Fant ikke rutedata i", inFile, "- forventer et array med {fromName,toName,distanceMeters,path}.");
  process.exit(3);
}

const stops = [];
const seen = new Set();
for (const seg of routes) {
  if (seg.fromName && !seen.has(seg.fromName)) { seen.add(seg.fromName); stops.push(seg.fromName); }
  if (seg.toName && !seen.has(seg.toName)) { seen.add(seg.toName); stops.push(seg.toName); }
}

const routesPoly = routes.map(seg => ({
  fromName: seg.fromName,
  toName: seg.toName,
  distanceMeters: seg.distanceMeters,
  polyline: encodePolyline(seg.path)
}));

fs.writeFileSync("routes.raw.json", JSON.stringify(routes, null, 0), "utf8");
fs.writeFileSync("routes.poly.json", JSON.stringify(routesPoly, null, 0), "utf8");
fs.writeFileSync("stops.json", JSON.stringify(stops, null, 0), "utf8");
console.log("OK:", inFile, "-> routes.poly.json, stops.json, routes.raw.json");
