import fs from "node:fs";
import vm from "node:vm";

const inFile = process.argv[2];
if (!inFile || !fs.existsSync(inFile)) {
  console.error("Finner ikke filen:", inFile || "(mangler argument)");
  process.exit(1);
}

function encSigned(n){ n<<=1; if(n<0)n=~n; let out=""; while(n>=0x20){ out+=String.fromCharCode((0x20|(n&0x1f))+63); n>>=5; } out+=String.fromCharCode(n+63); return out; }
function encodePolyline(latlngs){
  let lastLat=0,lastLng=0,res="";
  for(const pair of latlngs){
    const lat = Array.isArray(pair) ? pair[0] : pair.lat ?? pair.latitude;
    const lng = Array.isArray(pair) ? pair[1] : pair.lng ?? pair.lon ?? pair.long ?? pair.longitude;
    const ilat=Math.round(lat*1e5), ilng=Math.round(lng*1e5);
    res += encSigned(ilat-lastLat)+encSigned(ilng-lastLng);
    lastLat=ilat; lastLng=ilng;
  }
  return res;
}

let code = fs.readFileSync(inFile, "utf8");
let transformed = code
  .replace(/export\s+default\s+/, "globalThis.ROUTES = ")
  .replace(/export\s+(const|let|var)\s+[A-Za-z0-9_]+\s*=\s*/, "globalThis.ROUTES = ")
  .replace(/\s+as\s+const/g, "")
  .replace(/module\.exports\s*=\s*/, "globalThis.ROUTES = ");

if (!/globalThis\.ROUTES\s*=/.test(transformed)) {
  const trimmed = transformed.trimStart();
  if (trimmed.startsWith("[")) transformed = "globalThis.ROUTES = " + transformed;
}

const sandbox = { console, globalThis: {} };
vm.createContext(sandbox);
try {
  vm.runInContext(transformed, sandbox, { filename: inFile, timeout: 30000 });
} catch (e) {
  console.error("Klarte ikke å kjøre rutedata-filen:", inFile);
  console.error(String(e));
  process.exit(2);
}

const val = sandbox.globalThis.ROUTES;
if (!Array.isArray(val) || !val.length || !val[0] || !("fromName" in val[0]) || !("toName" in val[0]) || !Array.isArray(val[0].path)) {
  console.error("Fant ikke forventet struktur (array av {fromName,toName,distanceMeters,path}).");
  process.exit(3);
}

const stops = [];
const seen = new Set();
for (const seg of val) {
  if (seg.fromName && !seen.has(seg.fromName)) { seen.add(seg.fromName); stops.push(seg.fromName); }
  if (seg.toName && !seen.has(seg.toName)) { seen.add(seg.toName); stops.push(seg.toName); }
}
const routesPoly = val.map(seg => ({
  fromName: seg.fromName,
  toName: seg.toName,
  distanceMeters: seg.distanceMeters,
  polyline: encodePolyline(seg.path)
}));

fs.writeFileSync("routes.raw.json", JSON.stringify(val), "utf8");
fs.writeFileSync("routes.poly.json", JSON.stringify(routesPoly), "utf8");
fs.writeFileSync("stops.json", JSON.stringify(stops), "utf8");
console.log("OK:", inFile, "-> routes.poly.json, stops.json, routes.raw.json");
