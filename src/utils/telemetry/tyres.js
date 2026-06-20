// The stint covering a given lap (lap_start..lap_end inclusive), or null when
// none covers it (missing data, practice gaps).
export function stintForLap(stints, driverNumber, lapNumber) {
  if (!stints?.length || driverNumber == null || lapNumber == null) return null;
  return (
    stints.find(
      (s) =>
        s.driver_number === driverNumber &&
        lapNumber >= s.lap_start &&
        lapNumber <= s.lap_end,
    ) ?? null
  );
}

export function compoundForLap(stints, driverNumber, lapNumber) {
  return stintForLap(stints, driverNumber, lapNumber)?.compound ?? null;
}

// Laps on the current tyre by the given lap: stint's starting age plus how far
// into the stint this lap is. Null when no stint covers the lap.
export function tyreAgeForLap(stints, driverNumber, lapNumber) {
  const stint = stintForLap(stints, driverNumber, lapNumber);
  if (!stint) return null;
  return (stint.tyre_age_at_start ?? 0) + (lapNumber - stint.lap_start);
}

// "SOFT" → "Soft" for display.
export function titleCaseCompound(compound) {
  if (!compound) return compound;
  return compound.charAt(0).toUpperCase() + compound.slice(1).toLowerCase();
}
