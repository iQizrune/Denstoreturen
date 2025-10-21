import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

type ThemeKey = keyof typeof Colors["light"]; // "text" | "background" | ...

export function useThemeColor(opts: { light?: string; dark?: string }, key: ThemeKey): string {
  const scheme = useColorScheme(); // "light" | "dark"
  const colorFromProps = opts[scheme];
  if (colorFromProps) return colorFromProps;
  return Colors[scheme][key];
}
