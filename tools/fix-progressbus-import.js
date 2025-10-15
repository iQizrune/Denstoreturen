const fs=require('fs');
const p='app/lib/progressBus.ts';
let s=fs.readFileSync(p,'utf8');
const imp='import { logEvent } from "../../src/dev/EventLog";';
s=s.replace(/^\s*import\s*\{\s*logEvent\s*\}\s*from\s*["']\.{1,2}\/src\/dev\/EventLog["']\s*;\s*\n/m,'');
if(!s.includes(imp)){
  const lines=s.split('\n');
  let lastImport=-1;
  for(let i=0;i<lines.length;i++){ if(/^\s*import\b/.test(lines[i])) lastImport=i; }
  if(lastImport>=0){ lines.splice(lastImport+1,0,imp);} else { lines.unshift(imp); }
  s=lines.join('\n');
}
fs.writeFileSync(p,s);
console.log('fixed',p);
