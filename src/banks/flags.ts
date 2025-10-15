import { Q } from "./types";
import { shuffle } from "./util";

export function makeFlagQ(answer: string, image: string, labels: string[]): Q {
  const opts = labels.map((label, i) => ({ id: String.fromCharCode(97 + i), label }));
  const correctId = String.fromCharCode(97 + labels.indexOf(answer));
  return {
    id: `flag-${image.split("/").pop()?.replace(".png", "")}`,
    text: "Hvilket land sitt flagg er dette?",
    image,
    kind: "flag",
    options: opts,
    correctId,
    meta: { difficulty: "enkel" },
  };
}

export const flagEasy: Q[] = shuffle([
  makeFlagQ("Norge", "/assets/flags/norway.png", ["Norge", "Sverige", "Finland", "Island"]),
  makeFlagQ("Sverige", "/assets/flags/sweden.png", ["Danmark", "Sverige", "Ukraina", "UK"]),
  makeFlagQ("Italia", "/assets/flags/italy.png", ["Irland", "Bulgaria", "Italia", "Ungarn"]),
  makeFlagQ("Canada", "/assets/flags/canada.png", ["USA", "Canada", "Østerrike", "UK"]),
  makeFlagQ("Japan", "/assets/flags/japan.png", ["Japan", "Kina", "Sør‑Korea", "Monaco"]),
  makeFlagQ("Brasil", "/assets/flags/brazil.png", ["Brasil", "Argentina", "Mexico", "Portugal"]),
]);

export const flagMedium: Q[] = shuffle([
  makeFlagQ("Tyskland", "/assets/flags/germany.png", ["Belgia", "Tyskland", "Spania", "Romania"]),
  makeFlagQ("Hellas", "/assets/flags/greece.png", ["Israel", "Hellas", "Uruguay", "Argentina"]),
  makeFlagQ("Nederland", "/assets/flags/netherlands.png", [
    "Luxembourg",
    "Nederland",
    "Frankrike",
    "Russland",
  ]),
  makeFlagQ("Ukraina", "/assets/flags/ukraine.png", ["Sverige", "Ukraina", "Kasakhstan", "UK"]),
  makeFlagQ("Finland", "/assets/flags/finland.png", ["Finland", "Sverige", "Hellas", "Skottland"]),
  makeFlagQ("Storbritannia", "/assets/flags/uk.png", ["Australia", "New Zealand", "Storbritannia", "USA"]),
]);

export const flagHard: Q[] = shuffle([
  makeFlagQ("Andorra", "/assets/flags/andorra.png", ["Andorra", "Moldova", "Romania", "Tsjad"]),
  makeFlagQ("Latvia", "/assets/flags/latvia.png", ["Latvia", "Litauen", "Polen", "Østerrike"]),
  makeFlagQ("Litauen", "/assets/flags/lithuania.png", ["Bolivia", "Litauen", "Ghana", "Etiopia"]),
  makeFlagQ("Serbia", "/assets/flags/serbia.png", ["Russland", "Serbia", "Slovakia", "Kroatia"]),
  makeFlagQ("Algerie", "/assets/flags/algerie.png", ["Marokko", "Tunisia", "Algerie", "Saudi‑Arabia"]),
  makeFlagQ("Gambia", "/assets/flags/gambia.png", ["Ghana", "Gambia", "Kenya", "Sierra Leone"]),
  makeFlagQ("Pakistan", "/assets/flags/pakistan.png", ["Afghanistan", "Iran", "Pakistan", "India"]),
  makeFlagQ("Romania", "/assets/flags/rumenia.png", ["Tsjad", "Romania", "Andorra", "Colombia"]),
]);
