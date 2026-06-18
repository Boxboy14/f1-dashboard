// One config row per telemetry chart. Drives the whole chart stack so adding or
// reordering a channel is a one-line change. `lineType` "step" is for discrete
// channels (brake/gear/DRS) so they read as honest on/off-style steps.
const CHANNELS = [
  { key: "speed", label: "Speed", unit: "km/h", lineType: "line", domain: ["auto", "auto"] },
  { key: "throttle", label: "Throttle", unit: "%", lineType: "line", domain: [0, 100] },
  { key: "brake", label: "Brake", unit: "%", lineType: "step", domain: [0, 100] },
  { key: "gear", label: "Gear", unit: "", lineType: "step", domain: [0, 8] },
  { key: "rpm", label: "RPM", unit: "", lineType: "line", domain: ["auto", "auto"] },
  { key: "drs", label: "DRS", unit: "on/off", lineType: "step", domain: [0, 1] },
];

// Comparison palette: driver A vs driver B, consistent across charts, summary,
// and track map. Salt palette tokens (theme-independent) so there's no raw hex.
// `DRIVER_COLOR_VARS` are the raw token names for APIs that need a resolved
// string (Recharts stroke); `DRIVER_COLORS` are `var()` refs for CSS/inline use.
const DRIVER_COLOR_VARS = ["--salt-color-teal-500", "--salt-color-orange-500"];
const DRIVER_COLORS = DRIVER_COLOR_VARS.map((v) => `var(${v})`);

export { CHANNELS, DRIVER_COLORS, DRIVER_COLOR_VARS };
