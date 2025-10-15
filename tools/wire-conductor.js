#!/usr/bin/env node
const fs = require('fs');
const path = process.argv[2];
const phase = process.argv[3];
if (!path || !phase) process.exit(2);
if (!fs.existsSync(path)) { console.log('skip (not found):', path); process.exit(0); }
let s = fs.readFileSync(path,'utf8');
if (!/conductor/.test(s)) {
  const lines = s.split('\n');
  let lastImport = -1;
  for (let i=0;i<lines.length;i++) if (/^\s*import\b/.test(lines[i])) lastImport = i;
  const imp = 'import { conductor } from "../src/engine";';
  if (lastImport >= 0) lines.splice(lastImport+1, 0, imp); else lines.unshift(imp);
  s = lines.join('\n');
}
const reUse = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{\s*/m;
if (reUse.test(s) && !new RegExp(`conductor\\.toPhase\\(["'\`]${phase}["'\`]\\)`).test(s)) {
  s = s.replace(reUse, m => m + `try { conductor.toPhase("${phase}"); } catch {}\n`);
}
fs.writeFileSync(path, s);
console.log('wired:', path, '->', phase);
