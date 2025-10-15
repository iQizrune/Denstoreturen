const fs = require('fs');

const file = process.argv[2];
if (!file) { process.exit(1); }
let s = fs.readFileSync(file, 'utf8');

if (!/from\s+["']\.\.\/\.\.\/src\/dev\/EventLog["']/.test(s)) {
  const lines = s.split('\n');
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*import\b/.test(lines[i])) lastImport = i;
  }
  const imp = 'import { logEvent } from "../../src/dev/EventLog";';
  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, imp);
  } else {
    lines.unshift(imp);
  }
  s = lines.join('\n');
}

const re = /(export\s+function\s+publishMeters\s*\(\s*meters\s*:\s*number\s*\)\s*\{[\s\S]*?)(\s*listeners\.forEach\(\s*\(fn\)\s*=>\s*fn\(d\)\s*\)\s*;)/;
if (re.test(s)) {
  s = s.replace(re, (_m, a, b) => a + ' try { logEvent("meter/change", { meters: (meters|0) }); } catch {}\n' + b);
}

fs.writeFileSync(file, s);
console.log('patched', file);
