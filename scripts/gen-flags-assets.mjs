// Scanner assets/flags/* og genererer src/banks/flagsAssets.ts med statiske require()-linjer.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FLAGS_DIR = path.join(ROOT, "assets", "flags");
const OUT = path.join(ROOT, "src", "banks", "flagsAssets.ts");

function toKey(name) {
  // "no.png" -> "no", "us@2x.webp" -> "us"
  return name.replace(/\.[a-z0-9]+$/i, "").replace(/@.*$/, "").toLowerCase();
}

function gen() {
  if (!fs.existsSync(FLAGS_DIR)) {
    console.error("Fant ikke", FLAGS_DIR, "(sørg for at assets/flags finnes)");
    process.exit(1);
  }
  const files = fs.readdirSync(FLAGS_DIR)
    .filter(f => /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(f));

  const entries = files.map(f => {
    const key = toKey(f);
    return `  "${key}": require("@/assets/flags/${f}"),`;
  }).join("\n");

  const code = `// AUTOMATISK GENERERT – IKKE REDIGER FOR HÅND
// Kjør: node scripts/gen-flags-assets.mjs
export const FLAGS_ASSETS: Record<string, any> = {
${entries}
};
`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, code);
  console.log("✅ Skrev", OUT, `(${files.length} filer)`);
}

gen();
