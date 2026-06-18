import { Switch } from "@salt-ds/core";
import useTheme from "./useTheme.js";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <Switch
      checked={theme === "light"}
      onChange={toggleTheme}
      label={theme === "light" ? "Light" : "Dark"}
    />
  );
};

export default ThemeToggle;
