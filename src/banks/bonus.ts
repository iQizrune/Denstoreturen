import { Q } from "./types";
import { shuffle } from "./util";

export const bonusEasyBank: Q[] = shuffle([
  {
    id: "be1",
    text: "Hva heter Norges lengste elv?",
    kind: "bonus",
    options: [
      { id: "a", label: "Glomma" },
      { id: "b", label: "Numedalslågen" },
      { id: "c", label: "Drammenselva" },
      { id: "d", label: "Nidelva" },
    ],
    correctId: "a",
  },
]);

export const bonusMediumBank: Q[] = shuffle([
  {
    id: "bm1",
    text: 'Hvem malte "Skrik"?',
    kind: "bonus",
    options: [
      { id: "a", label: "Edvard Munch" },
      { id: "b", label: "Harald Sohlberg" },
      { id: "c", label: "Christian Krohg" },
      { id: "d", label: "Nikolai Astrup" },
    ],
    correctId: "a",
  },
]);

export const bonusHardBank: Q[] = shuffle([
  {
    id: "bh1",
    text: "Hva heter det høyeste fjellet i Europa utenfor Kaukasus?",
    kind: "bonus",
    options: [
      { id: "a", label: "Mont Blanc" },
      { id: "b", label: "Matterhorn" },
      { id: "c", label: "Dufourspitze" },
      { id: "d", label: "Grossglockner" },
    ],
    correctId: "a",
  },
]);
