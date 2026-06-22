const STORAGE_KEY = "telemetry-selection";

export function readTelemetrySelection(year) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    return parsed && parsed.year === year ? parsed : null;
  } catch {
    return null;
  }
}

export function writeTelemetrySelection({
  year,
  meetingKey,
  sessionKey,
  driverNumbers,
  lapNumber,
}) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        year,
        meetingKey,
        sessionKey,
        driverNumbers,
        lapNumber,
      }),
    );
  } catch {
    console.error("Failed to write telemetry selection to sessionStorage");
  }
}
