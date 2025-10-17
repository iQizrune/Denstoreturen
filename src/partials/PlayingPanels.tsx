import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { publishMeters, getMetersSnapshot } from "@/src/lib/progressBus";

type Opt = { id: string; label: string; isCorrect?: boolean };
type QA = { id: string; text: string; options: Opt[] };

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function asArray(x: unknown): any[] {
  if (Array.isArray(x)) return x;
  if (x && typeof x === "object") return Object.values(x as any);
  return [];
}
function pickLabel(o: any): string {
  const keys = ["text", "label", "title", "name", "value"];
  for (const k of keys) {
    const v = o?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const s = String(o ?? "");
  return s && s !== "[object Object]" ? s : "";
}
function flagTrue(v: any): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return false;
}
function toOptions(raw: any): Opt[] {
  const arr = asArray(raw?.options ?? raw?.choices ?? raw?.alternatives ?? []);
  const mapped: (Opt | null)[] = arr.map((o: any, j: number) => {
    const label = pickLabel(o);
    if (!label) return null;
    const isCorrect = flagTrue(o?.isCorrect ?? o?.correct ?? o?.ok ?? o?.right ?? o?.a);
    const id: string = (o?.id ?? `o${j + 1}`).toString();
    return { id, label, isCorrect };
  });
  const out = mapped.filter((x): x is Opt => x !== null);
  if (!out.some((o) => o.isCorrect) && out.length > 0) out[0].isCorrect = true;
  return out;
}
function normalizeOne(raw: any, i: number): QA | null {
  if (!raw) return null;
  const id: string = (raw.id ?? `q${i + 1}`).toString();
  const text: string = pickLabel(raw.q ?? raw.question ?? raw.text ?? raw);
  const options = toOptions(raw);
  if (!text || options.length < 2) return null;
  return { id, text, options };
}
function normalizeBank(x: unknown): QA[] {
  const arr = asArray(x);
  return arr.map(normalizeOne).filter((q): q is QA => !!q);
}

// Prøv å hente «main»-banker fra flere moduler uten å feile hardt.
function loadMainBanks(): QA[] {
  let acc: QA[] = [];

  try {
    const local = require("@/src/banks/local");
    const BANKS = local?.BANKS ?? {};
    const keys = ["general","kunst","historie","musikk","sport","science","geografi"];
    for (const k of keys) acc = acc.concat(normalizeBank((BANKS as any)[k]));
  } catch {}

  try {
    const core = require("@/src/banks/core");
    acc = acc.concat(
      normalizeBank(core?.easyBank),
      normalizeBank(core?.mediumBank),
      normalizeBank(core?.hardBank)
    );
  } catch {}

  try {
    const bonus = require("@/src/banks/bonus");
    acc = acc.concat(
      normalizeBank(bonus?.bonusEasyBank),
      normalizeBank(bonus?.bonusMediumBank),
      normalizeBank(bonus?.bonusHardBank)
    );
  } catch {}

  try {
    const lightning = require("@/src/banks/lightning");
    const LB = lightning?.LIGHTNING_BANKS ?? {};
    const lk = ["sport","kunst","historie","musikk"];
    for (const k of lk) acc = acc.concat(normalizeBank((LB as any)[k]));
  } catch {}

  // Eksplisitt IKKE: byer.ts (stoppspørsmål)
  return acc;
}

export default function PlayingPanels() {
  const queue: QA[] = useMemo(() => {
    let base = loadMainBanks();
    if (base.length === 0) return [];

    // Bygg en kø på minst 12
    let bag: QA[] = [];
    while (bag.length < 12) {
      bag = bag.concat(shuffle(base));
      if (bag.length > 36) break;
    }
    bag = bag.slice(0, 12);
    return shuffle(bag);
  }, []);

  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const qa: QA | undefined = queue[i];

  useEffect(() => { setChosen(null); }, [i]);

  if (!qa) {
    return (
      <View style={{ padding:16, backgroundColor:'#111', flex:1, alignItems:'center', justifyContent:'center' }}>
        <Text style={{ color:'#d1d5db' }}>Ingen spørsmål tilgjengelig.</Text>
      </View>
    );
  }

  const onPick = (opt: Opt) => {
    if (chosen) return;
    setChosen(opt.id);
    if (opt.isCorrect) {
      const cur = getMetersSnapshot();
      publishMeters(cur + 10);
    }
    setTimeout(() => setI((prev) => prev + 1), 500);
  };

  return (
    <View style={{ flex:1, backgroundColor:'#111', padding:16, gap:12 }}>
      <Text style={{ color:'white', fontSize:18, fontWeight:'700' }}>{qa.text}</Text>
      <View style={{ gap:8 }}>
        {qa.options.map((opt: Opt) => {
          const picked = chosen === opt.id;
          const showState = !!chosen;
          const bg = !showState ? '#e5e7eb' : (opt.isCorrect ? '#10b981' : (picked ? '#ef4444' : '#e5e7eb'));
          const fg = !showState ? '#111827' : (opt.isCorrect || picked ? 'white' : '#111827');
          return (
            <Pressable
              key={opt.id}
              onPress={() => onPick(opt)}
              style={{ backgroundColor:bg, padding:14, borderRadius:12 }}
            >
              <Text style={{ color:fg, fontWeight:'700' }}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
