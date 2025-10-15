const fs = require('fs');

// ---------- app/play.tsx ----------
{
  const p = 'app/play.tsx';
  let s = fs.readFileSync(p, 'utf8');

  // 1) Legg til: const [correct, setCorrect] = useState(0);
  if (!/const\s*\[\s*correct\s*,\s*setCorrect\s*\]/.test(s)) {
    if (/const\s*\[\s*Panel\s*,\s*setPanel\s*\]\s*=\s*useState/.test(s)) {
      s = s.replace(
        /(const\s*\[\s*Panel\s*,\s*setPanel\s*\]\s*=\s*useState[^\n]*\n)/,
        `$1const correctInit = 0;\nconst [correct, setCorrect] = useState(correctInit);\n`
      );
    } else if (/const\s*router\s*=\s*useRouter\(\)\s*;/.test(s)) {
      s = s.replace(
        /(const\s*router\s*=\s*useRouter\(\)\s*;\s*\n)/,
        `$1const [correct, setCorrect] = useState(0);\n`
      );
    }
  }

  // 2) Panel onCorrect: legg til setCorrect(c => c + 1)
  s = s.replace(
    /onCorrect=\{\s*\(\)\s*=>\s*\{\s*publishMeters\(meters \+ 10\);\s*setAnswered\(true\);\s*\}\s*\}/,
    'onCorrect={() => { publishMeters(meters + 10); setAnswered(true); setCorrect(c => c + 1); }}'
  );

  // 3) Fullfør-knappen: ?score=... &correct=...
  s = s.replace(
    /router\.replace\(`\/results\?score=\$\{meters\}`\)/,
    'router.replace(`/results?score=${meters}&correct=${correct}`)'
  );

  fs.writeFileSync(p, s);
  console.log('patched', p);
}

// ---------- app/results.tsx ----------
{
  const p = 'app/results.tsx';
  let s = fs.readFileSync(p, 'utf8');

  // 1) utvid param-typen (hvis finnes)
  s = s.replace(
    /useLocalSearchParams<\{\s*score\?:\s*string\s*\}\>\(\)/,
    'useLocalSearchParams<{ score?: string; correct?: string }>()'
  );

  // 2) les correct (k) rett etter n = Number(score ?? 0);
  if (!/const\s+k\s*=/.test(s)) {
    s = s.replace(
      /(const\s+n\s*=\s*Number\(score\s*\?\?\s*0\)\s*;\s*\n)/,
      `$1const k = Number(correct ?? 0);\n`
    );
  }

  // 3) etter "Du fikk {n} poeng" legg til "Riktige svar: {k}"
  if (!/Riktige svar: \{k\}/.test(s)) {
    s = s.replace(
      /(<Text[^>]*>\s*Du fikk \{n\} poeng[^\n]*<\/Text>\s*\n)/,
      `$1      <Text style={{ color: "#bbb", fontSize: 16, marginTop: 4 }}>Riktige svar: {k}</Text>\n`
    );
  }

  fs.writeFileSync(p, s);
  console.log('patched', p);
}
