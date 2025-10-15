import { Q } from "./types";
import { shuffle } from "./util";

export const easyBank: Q[] = shuffle([
  {
    id: "e1",
    text: "Hva heter hovedstaden i Norge?",
    kind: "text",
    options: [
      { id: "a", label: "Oslo" },
      { id: "b", label: "Bergen" },
      { id: "c", label: "Trondheim" },
      { id: "d", label: "Stavanger" },
    ],
    correctId: "a",
    meta: { difficulty: "enkel" },
  },
  {
    id: "e2",
    text: "2 + 2 = ?",
    kind: "text",
    options: [
      { id: "a", label: "3" },
      { id: "b", label: "4" },
      { id: "c", label: "5" },
      { id: "d", label: "22" },
    ],
    correctId: "b",
    meta: { difficulty: "enkel" },
  },
]);

export const mediumBank: Q[] = shuffle([
  {
    id: "m1",
    text: "Hvilket år ble Norge selvstendig fra Sverige?",
    kind: "text",
    options: [
      { id: "a", label: "1814" },
      { id: "b", label: "1905" },
      { id: "c", label: "1945" },
      { id: "d", label: "1952" },
    ],
    correctId: "b",
    meta: { difficulty: "medium" },
  },
  {
    id: "m2",
    text: 'Hvem skrev "Sult"?',
    kind: "text",
    options: [
      { id: "a", label: "Henrik Ibsen" },
      { id: "b", label: "Knut Hamsun" },
      { id: "c", label: "Sigrid Undset" },
      { id: "d", label: "Tarjei Vesaas" },
    ],
    correctId: "b",
    meta: { difficulty: "medium" },
  },
]);

export const hardBank: Q[] = shuffle([
  {
    id: "h1",
    text: "Hva er den kjemiske formelen for bordsalt?",
    kind: "text",
    options: [
      { id: "a", label: "NaCl" },
      { id: "b", label: "KCl" },
      { id: "c", label: "NaCO3" },
      { id: "d", label: "CaCl2" },
    ],
    correctId: "a",
    meta: { difficulty: "vanskelig" },
  },
  {
    id: "h2",
    text: "Hvilket år ble FN etablert?",
    kind: "text",
    options: [
      { id: "a", label: "1919" },
      { id: "b", label: "1939" },
      { id: "c", label: "1945" },
      { id: "d", label: "1950" },
    ],
    correctId: "c",
    meta: { difficulty: "vanskelig" },
  },
]);

export const impossibleBank: Q[] = shuffle([
  {
    id: "u1",
    text: "Hva var kallenavnet på Eulers bevis for den store Fermat-setningen?",
    kind: "text",
    options: [
      { id: "a", label: "Eulers vei" },
      { id: "b", label: "Eulers fantastiske feil" },
      { id: "c", label: "Eulers bevis" },
      { id: "d", label: "Eulers identitet" },
    ],
    correctId: "b",
    meta: { difficulty: "umulig" },
  },
  {
    id: "u2",
    text: "Hvor mange bein har en tusenbein-art i snitt?",
    kind: "text",
    options: [
      { id: "a", label: "750" },
      { id: "b", label: "40" },
      { id: "c", label: "200" },
      { id: "d", label: "1000" },
    ],
    correctId: "c",
    meta: { difficulty: "umulig" },
  },
]);
