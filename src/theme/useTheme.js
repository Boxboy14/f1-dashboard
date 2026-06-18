import { useContext } from "react";
import { ThemeContext } from "./ThemeContext.js";

const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
};

export default useTheme;
