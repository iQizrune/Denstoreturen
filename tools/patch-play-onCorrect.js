const fs = require('fs');
const p = 'app/play.tsx';
let s = fs.readFileSync(p, 'utf8');

// 1) Gi <Panel> props onCorrect/onWrong (håndter <Panel />, <Panel/>, <Panel></Panel>)
const panelProps = `<Panel
  onCorrect={() => { publishMeters(meters + 10); setAnswered(true); }}
  onWrong={() => { publishMeters(meters); setAnswered(true); }}
/>`;
s = s
  .replace(/<Panel\s*\/>/, panelProps)
  .replace(/<Panel\s*\/\s*>/, panelProps)
  .replace(/<Panel>\s*<\/Panel>/, panelProps);

// 2) Fjern knappene "Riktig (+10)" og "Feil (0)"
s = s.replace(/<Pressable[\s\S]*?>[\s\S]*?Riktig\s*\(\+10\)[\s\S]*?<\/Pressable>\s*/m, '');
s = s.replace(/<Pressable[\s\S]*?>[\s\S]*?Feil\s*\(0\)[\s\S]*?<\/Pressable>\s*/m, '');

fs.writeFileSync(p, s);
console.log('patched', p);
