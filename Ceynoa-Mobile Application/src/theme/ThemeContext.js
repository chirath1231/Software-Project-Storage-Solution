import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildPalette } from "./colors";

const STORAGE_KEY = "@arena/theme-pref"; // "dark" | "light" | "system"

const ThemeContext = createContext({
  isDark: false,
  pref: "light",
  c: buildPalette(false),
  toggleTheme: () => {},
  setPref: () => {},
});

export function ThemeProvider({ children }) {
  const system = useColorScheme(); // "light" | "dark" | null
  const [pref, setPrefState] = useState("light");
  const [hydrated, setHydrated] = useState(false);

  // hydrate saved preference once
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setPrefState(saved);
      } catch (e) {
        // ignore — fall back to default
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setPref = (next) => {
    setPrefState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const isDark =
    pref === "system" ? system === "dark" : pref === "dark";

  const toggleTheme = () => setPref(isDark ? "light" : "dark");

  const value = useMemo(
    () => ({ isDark, pref, c: buildPalette(isDark), toggleTheme, setPref, hydrated }),
    [isDark, pref, hydrated]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
