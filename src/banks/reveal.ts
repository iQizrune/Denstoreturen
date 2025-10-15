// src/banks/reveal.ts
// NB: Ingen kobling til /assets/flags/ — kun Avdekking.
// Spørsmålene bruker feltet `avdekking` (ikke `image`) for å hindre flagg-heuristikk.

type Difficulty = "enkel" | "middels" | "vanskelig";

type Option = { id: string; text: string };

export type RevealQuestion = {
  kind: "reveal";
  id: string;
  text: string;
  avdekking: string; // <- peker direkte til /assets/Avdekking/...
  options: Option[];
  correctId: string;
  difficulty: Difficulty;
};

function makeRevealQ(
  id: string,
  avdekkingPath: string,
  choices: string[],
  correctText: string,
  difficulty: Difficulty,
): RevealQuestion {
  const options: Option[] = choices.map((t, i) => ({
    id: String.fromCharCode(65 + i), // A, B, C, D...
    text: t,
  }));
  const correct = options.find((o) => o.text === correctText);
  if (!correct) {
    throw new Error(`Correct choice "${correctText}" not found in choices for ${id}`);
  }
  return {
    kind: "reveal",
    id,
    text: "Hvem eller hva er dette?",
    avdekking: avdekkingPath,
    options,
    correctId: correct.id,
    difficulty,
  };
}

/* ------------------- ENKEL ------------------- */
export const revealEasy: RevealQuestion[] = [
  makeRevealQ(
    "reveal-elvis",
    "/assets/Avdekking/elvis.png",
    ["Elvis Presley", "Johnny Cash", "Frank Sinatra", "Buddy Holly"],
    "Elvis Presley",
    "enkel",
  ),
  makeRevealQ(
    "reveal-spiderman",
    "/assets/Avdekking/spiderman.jpg",
    ["Spider-Man", "Batman", "Superman", "Iron Man"],
    "Spider-Man",
    "enkel",
  ),
  makeRevealQ(
    "reveal-albert-einstein",
    "/assets/Avdekking/albert-einstein.jpg",
    ["Albert Einstein", "Isaac Newton", "Niels Bohr", "Thomas Edison"],
    "Albert Einstein",
    "enkel",
  ),
  makeRevealQ(
    "reveal-frihetsgudinnen",
    "/assets/Avdekking/frihetsgudinnen.jpg",
    ["Frihetsgudinnen", "Eiffeltårnet", "Big Ben", "Colosseum"],
    "Frihetsgudinnen",
    "enkel",
  ),
];

/* ------------------- MIDDELS ------------------- */
export const revealMedium: RevealQuestion[] = [
  makeRevealQ(
    "reveal-audrey-hepburn",
    "/assets/Avdekking/audrey-hepburn.jpg",
    ["Audrey Hepburn", "Marilyn Monroe", "Grace Kelly", "Elizabeth Taylor"],
    "Audrey Hepburn",
    "middels",
  ),
  makeRevealQ(
    "reveal-elizabeth-taylor",
    "/assets/Avdekking/elizabeth-taylor.jpg",
    ["Elizabeth Taylor", "Judy Garland", "Grace Kelly", "Katharine Hepburn"],
    "Elizabeth Taylor",
    "middels",
  ),
  makeRevealQ(
    "reveal-taj-mahal",
    "/assets/Avdekking/taj-mahal.jpg",
    ["Taj Mahal", "Den kinesiske mur", "Petra", "Machu Picchu"],
    "Taj Mahal",
    "middels",
  ),
  makeRevealQ(
    "reveal-muhammed-ali",
    "/assets/Avdekking/muhammed-ali.png",
    ["Muhammad Ali", "Joe Frazier", "Mike Tyson", "George Foreman"],
    "Muhammad Ali",
    "middels",
  ),
];

/* ------------------- VANSKELIG ------------------- */
export const revealHard: RevealQuestion[] = [
  makeRevealQ(
    "reveal-nelson-mandela",
    "/assets/Avdekking/nelson-mandela.png",
    ["Nelson Mandela", "Desmond Tutu", "Kofi Annan", "Julius Nyerere"],
    "Nelson Mandela",
    "vanskelig",
  ),
  makeRevealQ(
    "reveal-ghandi", // filnavnet er 'ghandi.png' i assets — behold akkurat stavelsen
    "/assets/Avdekking/ghandi.png",
    ["Mahatma Gandhi", "Jawaharlal Nehru", "Dalai Lama", "Indira Gandhi"],
    "Mahatma Gandhi",
    "vanskelig",
  ),
  makeRevealQ(
    "reveal-winston-churchhill", // filnavnet er 'winston-churchhill.png'
    "/assets/Avdekking/winston-churchhill.png",
    ["Winston Churchill", "Franklin D. Roosevelt", "Joseph Stalin", "Dwight D. Eisenhower"],
    "Winston Churchill",
    "vanskelig",
  ),
  makeRevealQ(
    "reveal-skrik",
    "/assets/Avdekking/skrik.png",
    ["Skrik", "Nattverden", "Guernica", "Stjernenatt"],
    "Skrik",
    "vanskelig",
  ),
];

/* Valgfritt samlet eksport (hvis dere har en aggregator som forventer det) */
export const revealBank = {
  easy: revealEasy,
  medium: revealMedium,
  hard: revealHard,
};
