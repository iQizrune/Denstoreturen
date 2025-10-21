import fs from 'fs';

const f = process.argv[2] || 'app/kart.tsx';
if (!fs.existsSync(f)) {
  console.error('Finner ikke fil:', f);
  process.exit(1);
}
let s = fs.readFileSync(f, 'utf8');
let changed = false;

// 1) Importer øverst (idempotent)
if (!s.includes('from "@/src/route/stopsFromData"')) {
  const imports =
`import { getOrderedStops } from "@/src/route/stopsFromData";
import { useCurrentStopIndex } from "@/src/hooks/useCurrentStopIndex";
`;
  s = imports + s;
  changed = true;
}

// 2) Sett inn STOPS + currentStopIndex i default-komponenten
const compRe = /export\s+default\s+function\s+[^(]*\([^)]*\)\s*\{/;
if (compRe.test(s) && !s.includes('const STOPS = getOrderedStops();')) {
  s = s.replace(compRe, (m) => m + '\n  const STOPS = getOrderedStops();\n  const currentStopIndex = useCurrentStopIndex(0);\n');
  changed = true;
}

// 3) Legg til props på <MapViewSvg .../>
if (!/stops=\{STOPS\}/.test(s) || !/currentStopIndex=\{currentStopIndex\}/.test(s)) {
  const tagRe = /<MapViewSvg\b([^>]*)\/>/;
  if (tagRe.test(s)) {
    s = s.replace(tagRe, (full, attrs) => {
      let newAttrs = attrs;
      if (!/stops=\{STOPS\}/.test(full)) newAttrs += '\n  stops={STOPS}';
      if (!/currentStopIndex=\{currentStopIndex\}/.test(full)) newAttrs += '\n  currentStopIndex={currentStopIndex}';
      return `<MapViewSvg${newAttrs}\n/>`;
    });
    changed = true;
  } else {
    console.warn('Fant ikke <MapViewSvg ... /> i', f);
  }
}

if (changed) {
  fs.copyFileSync(f, f + '.bak_' + Date.now());
  fs.writeFileSync(f, s);
  console.log('Oppdatert:', f, '✅');
} else {
  console.log('Ingen endringer nødvendig:', f);
}
