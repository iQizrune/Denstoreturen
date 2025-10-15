// Hjelpemidler (ééngangsbruk) – kobler samleobjekter til riktige stopp
// Bruk: import { HELP_ITEMS, isHelpValidFor } from "@/src/data/helpemidler";
export type HelpItemDef = {
  id: string;           // f.eks. "harpun"
  title: string;        // "Harpun"
  description?: string; // valgfritt UI
  validFor: string[];   // stopId-slugs der dette er "riktig" hjelpemiddel
};

export const HELP_ITEMS: Record<string, HelpItemDef> = {
  // EKSEMPLER – fyll på etter behov
  harpun: {
    id: "harpun",
    title: "Harpun",
    description: "Brukes ved kyst/hval – særlig Sandefjord.",
    validFor: ["sandefjord"],
  },
  gruvehjelm: {
    id: "gruvehjelm",
    title: "Gruvehjelm",
    description: "Beskytter i gruvebyer (Kongsberg).",
    validFor: ["kongsberg"],
  },
  fiskestang: {
    id: "fiskestang",
    title: "Fiskestang",
    description: "Hav og elv – f.eks. Bodø.",
    validFor: ["bodo"],
  },
};

export function isHelpValidFor(helpId: string, stopId: string): boolean {
  const def = HELP_ITEMS[helpId];
  return !!def && def.validFor.includes(stopId);
}

export function getHelpTitle(helpId: string): string {
  return HELP_ITEMS[helpId]?.title ?? helpId;
}
