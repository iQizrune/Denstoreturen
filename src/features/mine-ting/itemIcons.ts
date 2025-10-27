import { ImageSourcePropType } from "react-native";

// Prøver å require et ikon. Hvis mangler: returner undefined (RN-bundler feiler ellers).
const tryRequire = (path: string): ImageSourcePropType | undefined => {
  try {
    // @ts-ignore – RN bundler håndterer statiske require-paths
    return require(path);
  } catch {
    return undefined;
  }
};

// KEY → ikon. Husk å ha filen på disken:
// assets/images/hjelpemidler/harpun.png
export const itemIconMap: Record<string, ImageSourcePropType | undefined> = {
  harpun: tryRequire("../../../assets/images/hjelpemidler/harpun.png"),
};
