/** Minimal lokal bank hvis mangler (blir ikke brukt hvis du allerede har en ekte) */
export type QA = { q: string; a: string; choices: string[] };
const GENERAL: QA[] = [
  { q: "Test: 2+2?", a: "4", choices: ["3","4","5","6"] },
];
const KUNST: QA[] = [
  { q: "Test: Hvem malte Mona Lisa?", a: "Leonardo da Vinci", choices: ["Leonardo da Vinci","Van Gogh","Munch","Picasso"] },
];
export const BANKS: Record<string, QA[]> = { general: GENERAL, kunst: KUNST };
export default BANKS;
