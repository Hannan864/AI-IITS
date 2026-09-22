import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEY = "iiui_app_theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to "light" for every new run of the app as explicitly requested
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = sessionStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "dark" || stored === "light") {
        return stored;
      }
    } catch (e) {
      // ignore storage errors
    }
    return "light"; // Default theme is white / Islamic Green light theme
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      sessionStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      // ignore storage errors
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
      body.classList.remove("dark");
      body.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      body.classList.remove("light");
      body.classList.add("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
