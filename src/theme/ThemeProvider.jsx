import { useState, useCallback, useEffect } from "react";
import { SaltProvider } from "@salt-ds/core";
import { ThemeContext } from "./ThemeContext.js";

const STORAGE_KEY = "f1-theme";

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "dark";
  } catch {
    return "dark";
  }
};

const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Mirror the theme onto <html data-theme> + color-scheme (so native controls,
  // scrollbars, and the ag-grid "inherit" scheme follow it) and persist it.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable — the theme just won't persist */
    }
  }, [theme]);

  const setTheme = useCallback((next) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <SaltProvider mode={theme} applyClassesTo="root">
        {children}
      </SaltProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
