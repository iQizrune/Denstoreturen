// tools/convert-legs.cjs
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const inFile = process.argv[2];
if (!inFile) {
  console.error("bruk: node tools/convert-legs.cjs <sti/til/route-globals.js>");
  process.exit(1);
}

const src = fs.readFileSync(inFile, "utf8");

// 1) Gjør ESM/TS-aktig syntaks kjørbar i Node-vm
let code = src
  // dropp ev. TS type-eksporter
  .replace(/export\s+type\s+[^;]+;?/g, "")
  // gjør 'export const X =' om til 'window.X ='
  .replace(/\bexport\s+const\s+ROUTE_LEGS\s*=/, "window.ROUTE_LEGS =")
  .replace(/\bexport\s+const\s+ROUTE_NODES\s*=/, "window.ROUTE_NODES =")
  .replace(/\bexport\s+const\s+ROUTE_TOTAL_METERS\s*=/, "window.ROUTE_TOTAL_METERS =")
  // dropp 'export { ... }'
  .replace(/\bexport\s*\{[^}]*\};?/g, "");

// 2) Sandbox med “nettleser-stubber”
const sandbox = {};
sandbox.window = sandbox;           // la window peke til sandbox
sandbox.global = sandbox;           // noen filer refererer global
sandbox.globalThis = sandbox;

// Minimal Event + event-metoder
sandbox.Event = function Event(name) { this.type = name; };
const noop = () => {};
sandbox.window.addEventListener = noop;
sandbox.window.removeEventListener = noop;
sandbox.window.dispatchEvent = noop;

// 3) Kjør koden i sandbox
try {
  vm.runInNewContext(code, sandbox, { filename: inFile, timeout: 10000 });
} catch (err) {
  console.error("Klarte ikke å kjøre rutedata-filen:", inFile);
  console.error(err);
  process.exit(1);
}

// 4) Hent ut legs og skriv JSON
const legs =
  sandbox.window.ROUTE_LEGS ||
  sandbox.ROUTE_LEGS ||
  sandbox.global.ROUTE_LEGS;

if (!Array.isArray(legs)) {
  console.error("Fant ikke ROUTE_LEGS i " + inFile);
  process.exit(1);
}

fs.mkdirSync(path.join("assets", "route"), { recursive: true });
const outFile = path.join("assets", "route", "route-legs.json");
fs.writeFileSync(outFile, JSON.stringify({ ROUTE_LEGS: legs }));
console.log("OK:", outFile);
