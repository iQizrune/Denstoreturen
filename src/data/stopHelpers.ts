
/**
 * Kanonisk mapping: stopp-slug -> riktig hjelpemiddel (HelperKey).
 * Hold nøklene små og med samme slug som i rute/stops.
 * Fylles gradvis ut etter hvert som byquiz for stoppene er klare.
 */
export const CORRECT_HELPER_FOR_STOP_SLUG = {
  // Sørspissen og Lista/Farsund/Mandal–Kristiansand–Grimstad–Risør–Vestfold
  lindesnes: "lindesnesfyr",
  lista: "listafyr",
  farsund: "hollenderbyen",
  mandal: "sanden", // Sjøsanden i Mandal
  kristiansand: "dyreparken",
  risor: "denhvitebyvedskagerak", // (Risør kalles "Den hvite by ved Skagerak")
  grimstad: "ibsenoghamsun",
  horten: "marinemuseet",
  larvik: "farris",
  tonsberg: "slottsfjellet",
  } as const satisfies Record<string, string>;

