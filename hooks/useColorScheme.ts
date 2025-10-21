import { useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";

export function useColorScheme(): "light" | "dark" {
  const getScheme = () => (Appearance.getColorScheme() as ColorSchemeName) || "light";
  const [scheme, setScheme] = useState<"light" | "dark">(getScheme() === "dark" ? "dark" : "light");

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setScheme(colorScheme === "dark" ? "dark" : "light");
    });
    return () => sub.remove();
  }, []);

  return scheme;
}
