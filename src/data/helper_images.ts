// src/data/helper_images.ts

// Bevisst enkel typing her for å unngå union-trøbbel.
// Metro krever statiske require()–strenger; derfor eksplisitt mapping.
export const HELPER_IMAGES: Record<string, number> = {
  // Sør: Mandal → Vestfold (første batch vi har tatt i bruk)
  sanden: require("../../assets/helpers/sanden.png"), // Mandal (Sjøsanden)
  lindesnesfyr: require("../../assets/helpers/lindesnesfyr.png"),
  listafyr: require("../../assets/helpers/listafyr.png"),
  hollenderbyen: require("../../assets/helpers/hollenderbyen.png"),
  dyreparken: require("../../assets/helpers/dyreparken.png"),
  denhvitebyvedskagerak: require("../../assets/helpers/denhvitebyvedskagerak.png"),
  ibsenoghamsun: require("../../assets/helpers/ibsenoghamsun.png"),
  marinemuseet: require("../../assets/helpers/marinemuseet.png"),
  farris: require("../../assets/helpers/farris.png"),
  slottsfjellet: require("../../assets/helpers/slottsfjellet.png"),
  // legg til flere nøkler etter hvert som de tas i bruk...
};

// Hent bilde for en helper-key. Kaster hvis ikke finnes – avslører manglende ikon tidlig.
export function getHelperImage(key: string): number {
  const img = HELPER_IMAGES[key];
  if (!img) {
    // Hvis du har et fallback-ikon, bytt til:
    // return require("../../assets/helpers/_fallback.png");
    throw new Error(`Mangler ikon for hjelpemiddel: ${key}`);
  }
  return img;
}
