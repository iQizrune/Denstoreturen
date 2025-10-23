import COAT_IMAGES from "./coat_images";

/** Returnerer require(...)-objektet for byvåpenet, eller undefined om mangler. */
export function getCoatImage(slug: string) {
  return (COAT_IMAGES as Record<string, any>)[slug];
}

/** Trygg variant som faller tilbake til "missing-coat" om tilgjengelig. */
export function getCoatImageSafe(slug: string) {
  const img = (COAT_IMAGES as Record<string, any>)[slug];
  if (img) return img;
  return (COAT_IMAGES as Record<string, any>)["missing-coat"];
}
