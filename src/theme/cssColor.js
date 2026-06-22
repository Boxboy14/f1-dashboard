export const cssColor = (varName) =>
  getComputedStyle(document.documentElement).getPropertyValue(varName).trim() ||
  varName;
