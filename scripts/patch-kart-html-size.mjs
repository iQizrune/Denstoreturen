import fs from "fs";

const p = process.argv[2] || "assets/route/route-map.v3.html";
let s = fs.readFileSync(p, "utf8");

// 1) Sørg for tydelig CSS for #map
s = s.replace(/#map\s*\{[^}]*\}/, "#map { background:#f5f5f5; width:100vw; height:100vh; display:block; }");

// 2) Bytt ut W/H-utledning med robust måling + attrib + retry
s = s.replace(
/const\s+svg\s*=\s*document\.getElementById\("map"\);\s*[\r\n]+(\s*)const\s+W\s*=\s*[^;]+;\s*[\r\n]+(\s*)const\s+H\s*=\s*[^;]+;/,
`const svg = document.getElementById("map");
const measure = () => {
  const r = svg.getBoundingClientRect();
  let w = Math.floor(r.width || window.innerWidth || document.documentElement.clientWidth || 360);
  let h = Math.floor(r.height || window.innerHeight || document.documentElement.clientHeight || 640);
  if (w < 2) w = 360;
  if (h < 2) h = 640;
  return { w, h };
};
let { w: W, h: H } = measure();
svg.setAttribute("width", String(W));
svg.setAttribute("height", String(H));
svg.setAttribute("viewBox", \`0 0 \${W} \${H}\`);
let __tries = 0;
const __retrySize = () => {
  const r = measure();
  if ((r.w !== W || r.h !== H) && __tries < 10) {
    W = r.w; H = r.h;
    svg.setAttribute("width", String(W));
    svg.setAttribute("height", String(H));
    svg.setAttribute("viewBox", \`0 0 \${W} \${H}\`);
  }
  __tries++;
  if (__tries < 10) setTimeout(__retrySize, 80);
};
setTimeout(__retrySize, 0);`
);

// 3) Legg inn et lysgrått bakgrunns-rect hvis det ikke finnes
if (!/id="bgRect"/.test(s)) {
  s = s.replace(/<svg id="map"([^>]*)>/, (m, attrs) => {
    return `<svg id="map"\${attrs}>
  <rect id="bgRect" x="0" y="0" width="100%" height="100%" fill="#eeeeee"/>`;
  });
}

// 4) Utvid debug-teksten nederst til å vise W×H
s = s.replace(/dbg\("klart"\);/, 'dbg("klart " + W + "×" + H);');

fs.writeFileSync(p, s);
console.log("OK patched", p);
