"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "digital-store-theme";
const DEFAULT_THEME: Theme = "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (next: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readInitialTheme(): Theme {
  if (typeof document === "undefined") {
    return DEFAULT_THEME;
  }

  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") {
    return attr;
  }

  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>(() => readInitialTheme());

  const applyTheme = useCallback((next: Theme) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", next);
      document.documentElement.style.colorScheme = next;
    }

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore quota / privacy errors */
      }
    }

    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark");
  }, [applyTheme, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme: applyTheme, toggle }),
    [applyTheme, theme, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}

/**
 * Inline script string injected into <head> before hydration to prevent FOUC.
 * Reads localStorage → sets data-theme on <html> synchronously.
 */
export const themePreHydrationScript = `
(function(){try{
  var k='${STORAGE_KEY}';
  var v=localStorage.getItem(k);
  if(v!=='light'&&v!=='dark'){v='${DEFAULT_THEME}';}
  document.documentElement.setAttribute('data-theme',v);
  document.documentElement.style.colorScheme=v;
}catch(e){document.documentElement.setAttribute('data-theme','${DEFAULT_THEME}');}})();
`;
