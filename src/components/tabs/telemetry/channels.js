const CHANNELS = [
  { key: "speed", label: "Speed", unit: "km/h", lineType: "line", domain: ["auto", "auto"] },
  { key: "throttle", label: "Throttle", unit: "%", lineType: "line", domain: [0, 100] },
  { key: "brake", label: "Brake", unit: "%", lineType: "step", domain: [0, 100] },
  { key: "gear", label: "Gear", unit: "", lineType: "step", domain: [0, 8] },
  { key: "rpm", label: "RPM", unit: "", lineType: "line", domain: ["auto", "auto"] },
  { key: "drs", label: "DRS", unit: "on/off", lineType: "step", domain: [0, 1] },
];

const DRIVER_COLOR_VARS = ["--salt-color-teal-500", "--salt-color-orange-500"];
const DRIVER_COLORS = DRIVER_COLOR_VARS.map((v) => `var(${v})`);

export { CHANNELS, DRIVER_COLORS, DRIVER_COLOR_VARS };
