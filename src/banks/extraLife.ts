import { Q } from "./types";
import { shuffle } from "./util";

export const extraLifeBank: Q[] = shuffle([
  {
    id: "x1",
    text: "Hvilket dyr er Norges nasjonaldyr?",
    kind: "text",
    options: [
      { id: "a", label: "Elg" },
      { id: "b", label: "Fjellrev" },
      { id: "c", label: "Lunde" },
      { id: "d", label: "Havørn" },
    ],
    correctId: "a",
  },
  {
    id: "x2",
    text: "Hva heter den største planeten i solsystemet?",
    kind: "text",
    options: [
      { id: "a", label: "Jorda" },
      { id: "b", label: "Jupiter" },
      { id: "c", label: "Saturn" },
      { id: "d", label: "Neptun" },
    ],
    correctId: "b",
  },
    {
    id: "xl-3",
    text: "Hva er hovedstaden i Danmark?",
    options: [
      { id: "kbh", label: "København" },
      { id: "aarhus", label: "Aarhus" },
      { id: "odense", label: "Odense" }
    ],
    correctId: "kbh"
  },
  {
    id: "xl-4",
    text: "Hvor mange minutter er det i én time?",
    options: [
      { id: "45", label: "45" },
      { id: "60", label: "60" },
      { id: "90", label: "90" }
    ],
    correctId: "60"
  },
  {
    id: "xl-5",
    text: "Hva er Norges nasjonalfugl?",
    options: [
      { id: "fossekall", label: "Fossekall" },
      { id: "havorn", label: "Havørn" },
      { id: "spett", label: "Spett" }
    ],
    correctId: "fossekall"
  },
  {
    id: "xl-6",
    text: "Hvilket hav ligger vest for Norge?",
    options: [
      { id: "atlanterhavet", label: "Atlanterhavet" },
      { id: "stillehavet", label: "Stillehavet" },
      { id: "indiahavet", label: "Indiahavet" }
    ],
    correctId: "atlanterhavet"
  },
  {
    id: "xl-7",
    text: "Hvilken planet kalles den røde planeten?",
    options: [
      { id: "mars", label: "Mars" },
      { id: "venus", label: "Venus" },
      { id: "merkur", label: "Merkur" }
    ],
    correctId: "mars"
  },
  {
    id: "xl-8",
    text: "Hvilket av disse tallene er et primtall?",
    options: [
      { id: "19", label: "19" },
      { id: "20", label: "20" },
      { id: "21", label: "21" }
    ],
    correctId: "19"
  },
  {
    id: "xl-9",
    text: "Hvilket språk snakkes hovedsakelig i Brasil?",
    options: [
      { id: "spansk", label: "Spansk" },
      { id: "portugisisk", label: "Portugisisk" },
      { id: "fransk", label: "Fransk" }
    ],
    correctId: "portugisisk"
  },
  {
    id: "xl-10",
    text: "Hvem skrev «Romeo og Julie»?",
    options: [
      { id: "shakespeare", label: "William Shakespeare" },
      { id: "tolstoj", label: "Lev Tolstoj" },
      { id: "ibsen", label: "Henrik Ibsen" }
    ],
    correctId: "shakespeare"
  },

]);
