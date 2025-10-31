import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../");
const LIST = path.join(ROOT, "tilnychat/helpers.txt");
const TYPES_OUT = path.join(ROOT, "src/types/helpers.ts");
const IMAGES_OUT = path.join(ROOT, "src/data/helper_images.ts");
const ASSETS_DIR = path.join(ROOT, "assets/helpers"); // her forventes ikonene

function toSlug(s) {
  return s
    .trim()
    .toLowerCase()
    .replaceAll("å", "a")
    .replaceAll("ø", "o")
    .replaceAll("æ", "ae")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function readList(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Fant ikke listefil: ${file}`);
  }
  const raw = fs.readFileSync(file, "utf8");
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const items = [];
  const seen = new Set();
  for (const line of lines) {
    const slug = toSlug(line);
    if (!slug) continue;
    if (seen.has(slug)) {
      throw new Error(`Duplikat nøkkel etter normalisering: "${slug}" (fra linje: "${line}")`);
    }
    seen.add(slug);
    items.push(slug);
  }
  items.sort((a, b) => a.localeCompare(b));
  return items;
}

function checkAssets(keys) {
  const missing = [];
  for (const key of keys) {
    const png = path.join(ASSETS_DIR, `${key}.png`);
    const jpg = path.join(ASSETS_DIR, `${key}.jpg`);
    const jpeg = path.join(ASSETS_DIR, `${key}.jpeg`);
    const webp = path.join(ASSETS_DIR, `${key}.webp`);
    if (!(fs.existsSync(png) || fs.existsSync(jpg) || fs.existsSync(jpeg) || fs.existsSync(webp))) {
      missing.push(key);
    }
  }
  return missing;
}

function writeTypes(keys) {
  const unionLines = keys.map(k => `  | "${k}"`).join("\n");
  const arrLines = keys.map(k => `  "${k}",`).join("\n");
  const content = `// src/types/helpers.ts
// AUTO-GENERERT av tilnychat/scripts/apply-helper-names.mjs
// Rediger ikke for hånd; kjør scriptet på nytt når listen endres.

export type HelperKey =
${unionLines};

export function isHelperKey(x: string): x is HelperKey {
  return HELPER_KEYS.includes(x as HelperKey);
}

export const HELPER_KEYS: HelperKey[] = [
${arrLines}
];
`;
  fs.mkdirSync(path.dirname(TYPES_OUT), { recursive: true });
  fs.writeFileSync(TYPES_OUT, content, "utf8");
}

function writeImages(keys) {
  // Bygger statiske require-stier i prioritert rekkefølge: .png, .jpg, .jpeg, .webp
  const baseRel = "../../assets/helpers";

  const lines = keys.map(k => {
    const candidates = [
      `${k}.png`,
      `${k}.jpg`,
      `${k}.jpeg`,
      `${k}.webp`,
    ];
    let chosen = candidates.find(fn => fs.existsSync(path.join(ASSETS_DIR, fn)));
    if (!chosen) chosen = `${k}.png`; // fall-back; vil feile i runtime om ikke finnes
    // VIKTIG: kvoter nøkler som inneholder bindestrek
    return `  ${JSON.stringify(k)}: require("${baseRel}/${chosen}"),`;
  }).join("\n");

  const content = `// src/data/helper_images.ts
// AUTO-GENERERT av tilnychat/scripts/apply-helper-names.mjs
// Rediger ikke for hånd; kjør scriptet på nytt når listen/ikoner endres.

import type { HelperKey } from "../types/helpers";

// Deklarer require for å unngå TS7005 i enkelte oppsett
declare const require: any;

export const HELPER_IMAGES: Record<HelperKey, any> = {
${lines}
};

export function getHelperImage(key: HelperKey) {
  return HELPER_IMAGES[key];
}
`;
  fs.mkdirSync(path.dirname(IMAGES_OUT), { recursive: true });
  fs.writeFileSync(IMAGES_OUT, content, "utf8");
}


function main() {
  const keys = readList(LIST);
  if (keys.length === 0) {
    console.error("Ingen nøkler i tilnychat/helpers.txt");
    process.exit(2);
  }
  const missing = checkAssets(keys);
  if (missing.length) {
    console.warn("ADVARSEL: Manglende ikonfiler for nøklene:", missing.join(", "));
  }
  writeTypes(keys);
  writeImages(keys);
  console.log(`OK: Skrev ${TYPES_OUT} og ${IMAGES_OUT}`);
  console.log(`Nøkler (${keys.length}): ${keys.join(", ")}`);
}
main();
