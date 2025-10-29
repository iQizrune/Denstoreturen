// src/features/mine-ting/itemIcons.ts
import { ImageSourcePropType } from "react-native";

/**
 * Statisk mapping: RN krever literal i require(...).
 * Sørg for at disse filene finnes i prosjektet.
 *  - assets/images/hjelpemidler/harpun.png
 *  - assets/images/hjelpemidler/laks.png
 */
export const itemIconMap: Record<string, ImageSourcePropType | undefined> = {
  harpun: require("../../../assets/images/hjelpemidler/harpun.png"),
  laks: require("../../../assets/images/hjelpemidler/laks.png"),
};

export function getItemIcon(key: string): ImageSourcePropType | undefined {
  return itemIconMap[key];
}
