import { Q } from "./types";
import { shuffle } from "./util";

export const trickBank: Q[] = shuffle([
  {
    id: "t1",
    text: "Hvor mange måneder har 28 dager?",
    kind: "trick",
    options: [
      { id: "a", label: "Én" },
      { id: "b", label: "Tolv" },
      { id: "c", label: "Fem" },
    ],
    correctId: "b",
  },
  {
    id: "t2",
    text: "Hva kan du fange, men aldri kaste?",
    kind: "trick",
    options: [
      { id: "a", label: "En ball" },
      { id: "b", label: "En kald" },
      { id: "c", label: "En bølge" },
    ],
    correctId: "b",
  },
]);
