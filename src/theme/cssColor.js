// Resolve a CSS custom property to a concrete color string. Needed for APIs that
// set colors as SVG presentation attributes (e.g. Recharts `stroke`), which do
// NOT resolve `var(--…)` — unlike CSS/inline-style or ag-grid params, which do.
// Driver palette colors are theme-independent, so a render-time read is stable.
export const cssColor = (varName) =>
  getComputedStyle(document.documentElement).getPropertyValue(varName).trim() ||
  varName;
