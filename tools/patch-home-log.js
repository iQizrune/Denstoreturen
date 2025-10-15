const fs=require('fs');const p='app/home.tsx';
let s=fs.readFileSync(p,'utf8');
if(!/from ["']@\/src\/dev\/EventLog["']/.test(s)){
  const lines=s.split('\n');let lastImport=-1;
  for(let i=0;i<lines.length;i++) if(/^\s*import\b/.test(lines[i])) lastImport=i;
  const imp='import { logEvent } from \'@/src/dev/EventLog\';';
  if(lastImport>=0){ lines.splice(lastImport+1,0,imp);} else { lines.unshift(imp); }
  s=lines.join('\n');
}
if(!/logEvent\("phase-change",\s*\{\s*to:\s*"home"\s*\}\)/.test(s)){
  s=s.replace(/let\s+alive\s*=\s*true\s*;/,'let alive = true;\n    try { logEvent("phase-change", { to: "home" }); } catch {}');
}
fs.writeFileSync(p,s);
console.log('patched',p);
