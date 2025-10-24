export type CoatImage = { uri: string; width?: number; height?: number };

export const COAT_IMAGES: Record<string, CoatImage> = {
  // Fyll på ekte nøkler senere, f.eks. "mandal": { uri: "https://..." }
};

export function getCoatUri(key: string, fallback: string = ""): string {
  const hit = COAT_IMAGES[key];
  return hit?.uri ?? fallback;
}
