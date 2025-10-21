/* audit-refs.mjs — grov import-graf for å finne ubrukte filer
   Kjør: node audits/audit-refs.mjs
   Output: audits/import-graph.json, audits/unreferenced.json
*/
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const OUTDIR = path.join(ROOT, 'audits');
fs.mkdirSync(OUTDIR, { recursive: true });

const exts = ['.ts', '.tsx', '.js', '.jsx'];
const ignoreDirs = new Set(['node_modules', '.git', '.expo', 'audits', '.expo-shared']);

function walk(dir, acc=[]) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function isCode(p) {
  return exts.includes(path.extname(p));
}

function read(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function toRel(p) {
  return p.startsWith(ROOT) ? p.slice(ROOT.length+1) : p;
}

function resolveImport(fromFile, spec) {
  if (!spec) return null;
  if (spec.startsWith('http')) return null;
  // alias "@/"
  if (spec.startsWith('@/')) {
    const cand = path.join(ROOT, 'src', spec.slice(2));
    return resolveWithExts(cand);
  }
  // relative
  if (spec.startsWith('./') || spec.startsWith('../')) {
    const cand = path.join(path.dirname(fromFile), spec);
    return resolveWithExts(cand);
  }
  // external package
  return null;
}

function resolveWithExts(cand) {
  const tryExts = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
  for (const t of tryExts) {
    const p = cand + t;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return toRel(p);
  }
  return null;
}

const files = walk(ROOT).filter(isCode).map(toRel);
const imports = {};
const re = /import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)/g;

for (const f of files) {
  const abs = path.join(ROOT, f);
  const s = read(abs);
  imports[f] = [];
  let m; 
  while ((m = re.exec(s))) {
    const spec = m[1] || m[2];
    const resolved = resolveImport(abs, spec);
    if (resolved) imports[f].push(resolved);
  }
}

fs.writeFileSync(path.join(OUTDIR, 'import-graph.json'), JSON.stringify(imports, null, 2));

// finn filer som ingen peker til (unreferenced), men ekskluder inngangspunkter
const entryHints = new Set([
  'app/index.tsx','app/_layout.tsx','app/kart.tsx','app/play.tsx',
  'index.ts','index.tsx','src/main.tsx','src/App.tsx'
].filter(f => files.includes(f)));

const referenced = new Set();
for (const f of Object.keys(imports)) for (const dep of imports[f]) referenced.add(dep);

const unref = files.filter(f => !referenced.has(f) && !entryHints.has(f));
fs.writeFileSync(path.join(OUTDIR, 'unreferenced.json'), JSON.stringify(unref, null, 2));

console.log('✅ Wrote audits/import-graph.json and audits/unreferenced.json');
