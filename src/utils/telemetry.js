// Pure telemetry math — no React, no fetching. Turns raw /car_data samples into
// distance-aligned rows two drivers' laps can share on one x-axis.

// Cumulative distance (m) by integrating speed over time. /car_data has no
// distance field, so we derive it: speed (km/h) -> m/s, times the gap to the
// previous sample.
const deriveDistance = (samples) => {
  let distance = 0;
  let prev = null;
  return samples.map((s) => {
    if (prev) {
      const dtSeconds = (new Date(s.date) - new Date(prev.date)) / 1000;
      distance += (s.speed / 3.6) * dtSeconds;
    }
    prev = s;
    return { ...s, distance };
  });
};

const LINEAR_CHANNELS = ["speed", "throttle", "brake", "rpm"];
const NEAREST_CHANNELS = ["n_gear", "drs"];

const interpolateAt = (samples, distance) => {
  if (samples.length === 0) return null;
  if (distance <= samples[0].distance) return samples[0];
  if (distance >= samples.at(-1).distance) return samples.at(-1);

  let hi = samples.findIndex((s) => s.distance >= distance);
  const lo = hi - 1;
  const a = samples[lo];
  const b = samples[hi];
  const span = b.distance - a.distance;
  const t = span === 0 ? 0 : (distance - a.distance) / span;

  const row = { distance };
  for (const key of LINEAR_CHANNELS) row[key] = a[key] + (b[key] - a[key]) * t;
  for (const key of NEAREST_CHANNELS) row[key] = t < 0.5 ? a[key] : b[key];
  return row;
};

// Resample a driver's lap onto `points` evenly-spaced distances. Discrete
// channels (gear, drs) use nearest-sample so we never invent a "gear 4.3".
const resampleToGrid = (samplesWithDistance, points) => {
  if (samplesWithDistance.length === 0) return [];
  const total = samplesWithDistance.at(-1).distance;
  const step = total / (points - 1);
  return Array.from({ length: points }, (_, i) =>
    interpolateAt(samplesWithDistance, i * step)
  );
};

const decodeDrs = (v) => (v === 10 || v === 12 || v === 14 ? 1 : 0);

// Merge resampled grids into chart rows: { distance, speed_a, speed_b, ... }.
// Either grid may be null (single driver, or one driver had no valid lap) —
// only the present driver's columns are written. Both grids share the same
// point count, so index i is the same fraction of each lap (aligned corners).
const mergeDrivers = (gridA, gridB) => {
  const base = gridA ?? gridB;
  if (!base) return [];
  return base.map((_, i) => {
    const a = gridA?.[i];
    const b = gridB?.[i];
    const row = { distance: Math.round((a ?? b).distance) };
    if (a) {
      row.speed_a = a.speed;
      row.throttle_a = a.throttle;
      row.brake_a = a.brake;
      row.gear_a = a.n_gear;
      row.rpm_a = a.rpm;
      row.drs_a = decodeDrs(a.drs);
    }
    if (b) {
      row.speed_b = b.speed;
      row.throttle_b = b.throttle;
      row.brake_b = b.brake;
      row.gear_b = b.n_gear;
      row.rpm_b = b.rpm;
      row.drs_b = decodeDrs(b.drs);
    }
    return row;
  });
};

const formatLapTime = (seconds) => {
  if (seconds == null) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3).padStart(6, "0");
  return `${mins}:${secs}`;
};

export {
  deriveDistance,
  resampleToGrid,
  mergeDrivers,
  decodeDrs,
  formatLapTime,
};
