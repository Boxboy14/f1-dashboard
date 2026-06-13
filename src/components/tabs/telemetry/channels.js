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

// Fixed comparison palette: driver A vs driver B, consistent across every chart
// and the summary chips. Two high-contrast, dark-theme-friendly colors.
const DRIVER_COLORS = ["#3FC1C9", "#FB8C00"];

export { CHANNELS, DRIVER_COLORS };
