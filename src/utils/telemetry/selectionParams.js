const DRIVERS_SEPARATOR = ",";
const SELECTION_KEYS = ["event", "session", "drivers", "lap"];

export function hasSelectionParams(searchParams) {
  return SELECTION_KEYS.some((key) => searchParams.has(key));
}

export function parseSelectionParams(searchParams) {
  return {
    meetingKey: toNumber(searchParams.get("event")),
    sessionKey: toNumber(searchParams.get("session")),
    driverNumbers: toDriverNumbers(searchParams.get("drivers")),
    lapNumber: toLapNumber(searchParams.get("lap")),
  };
}

export function applySelectionToParams(
  searchParams,
  { meetingKey, sessionKey, driverNumbers, lapNumber },
) {
  const next = new URLSearchParams(searchParams);
  setOrDelete(next, "event", meetingKey);
  setOrDelete(next, "session", sessionKey);
  setOrDelete(
    next,
    "drivers",
    driverNumbers.length ? driverNumbers.join(DRIVERS_SEPARATOR) : null,
  );
  setOrDelete(next, "lap", lapNumber);
  return next;
}

function setOrDelete(params, key, value) {
  if (value == null || value === "") params.delete(key);
  else params.set(key, String(value));
}

function toNumber(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toDriverNumbers(value) {
  if (!value) return [];
  return value
    .split(DRIVERS_SEPARATOR)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 2);
}

function toLapNumber(value) {
  if (value == null || value === "fastest") return null;
  return toNumber(value);
}
