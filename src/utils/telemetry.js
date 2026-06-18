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
const round2 = (n) => Math.round(n * 100) / 100;

const mergeDrivers = (gridA, gridB) => {
  const base = gridA ?? gridB;
  if (!base) return [];
  return base.map((_, i) => {
    const a = gridA?.[i];
    const b = gridB?.[i];
    const row = { distance: Math.round((a ?? b).distance) };
    if (a) {
      row.speed_a = round2(a.speed);
      row.throttle_a = round2(a.throttle);
      row.brake_a = round2(a.brake);
      row.gear_a = a.n_gear;
      row.rpm_a = round2(a.rpm);
      row.drs_a = decodeDrs(a.drs);
    }
    if (b) {
      row.speed_b = round2(b.speed);
      row.throttle_b = round2(b.throttle);
      row.brake_b = round2(b.brake);
      row.gear_b = b.n_gear;
      row.rpm_b = round2(b.rpm);
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

// ── Track map geometry ───────────────────────────────────────────────────────

// Cumulative distance (m) along the racing line by straight-line arc length
// between consecutive position samples. /location already gives positions, so
// unlike car_data we measure distance from the path itself, not from speed.
const deriveTrackDistance = (location) => {
  let distance = 0;
  let prev = null;
  return location.map((p) => {
    if (prev) {
      distance += Math.hypot(p.x - prev.x, p.y - prev.y);
    }
    prev = p;
    return { x: p.x, y: p.y, distance };
  });
};

const interpolateXY = (points, distance) => {
  if (distance <= points[0].distance) return points[0];
  if (distance >= points.at(-1).distance) return points.at(-1);
  const hi = points.findIndex((p) => p.distance >= distance);
  const a = points[hi - 1];
  const b = points[hi];
  const span = b.distance - a.distance;
  const t = span === 0 ? 0 : (distance - a.distance) / span;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
};

// Resample the outline onto `points` evenly-spaced distances — the SAME
// resolution as resampleToGrid, so index i lines up with chartData[i].
const resampleTrack = (pointsWithDistance, points) => {
  if (pointsWithDistance.length < 2) return [];
  const total = pointsWithDistance.at(-1).distance;
  if (total === 0) return [];
  const step = total / (points - 1);
  return Array.from({ length: points }, (_, i) =>
    interpolateXY(pointsWithDistance, i * step)
  );
};

// Per grid-point winner slot (0/1) smoothed over `minisectorCount` equal-length
// minisectors: whoever carried more total speed through a minisector (= less
// time over equal distance) wins all of it. null if either driver is missing.
const buildDominance = (chartData, minisectorCount = 24) => {
  if (!chartData.length || chartData[0].speed_a == null || chartData[0].speed_b == null) {
    return null;
  }
  const n = chartData.length;
  const faster = new Array(n);
  const size = Math.ceil(n / minisectorCount);
  for (let start = 0; start < n; start += size) {
    const end = Math.min(start + size, n);
    let sumA = 0;
    let sumB = 0;
    for (let i = start; i < end; i++) {
      sumA += chartData[i].speed_a;
      sumB += chartData[i].speed_b;
    }
    const winner = sumA >= sumB ? 0 : 1;
    for (let i = start; i < end; i++) faster[i] = winner;
  }
  return faster;
};

// Per grid-point speed normalized 0..1 across the lap for one driver (`a`/`b`).
const buildSpeedShade = (chartData, suffix) => {
  const key = `speed_${suffix}`;
  const values = chartData.map((r) => r[key]);
  if (values.some((v) => v == null)) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v) => (v - min) / span);
};

export {
  deriveDistance,
  resampleToGrid,
  mergeDrivers,
  decodeDrs,
  formatLapTime,
  deriveTrackDistance,
  resampleTrack,
  buildDominance,
  buildSpeedShade,
};
