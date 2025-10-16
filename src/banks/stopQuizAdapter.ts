import { loadCityBank } from '@/src/banks/cityAdapter';

type QA = { q: string; a: string; choices: string[] };
type QOption = { id: string; label: string };

export type StopQ = {
  id: string;
  text: string;
  options: QOption[];
  correctId: string;
};

export function getStopQuiz(stopName: string): StopQ[] {
  const qs: QA[] = (loadCityBank(stopName) as QA[]) || [];
  const take = Math.min(6, qs.length);
  const picked = qs.slice(0, take);
  return picked.map((x, i) => {
    const options: QOption[] = (x.choices || []).slice(0, 4).map((c, idx) => ({
      id: String(idx),
      label: String(c),
    }));
    const correctIdx = Math.max(0, options.findIndex(o => o.label === x.a));
    return {
      id: `${stopName}-${i + 1}`,
      text: String(x.q ?? ''),
      options,
      correctId: correctIdx >= 0 ? String(correctIdx) : '0',
    };
  });
}
