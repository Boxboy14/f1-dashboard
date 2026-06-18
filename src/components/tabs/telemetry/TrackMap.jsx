import { Text } from "@salt-ds/core";
import { DRIVER_COLORS } from "./channels.js";
import styles from "./TrackMap.module.scss";

const PAD = 0.06; // padding around the track, as a fraction of its larger side

const TrackMap = ({ trackMap, drivers }) => {
  if (!trackMap) return null;

  if (trackMap.status === "no-data") {
    return (
      <div className={styles.wrap}>
        <Text styleAs="h3" className={styles.heading}>
          Track map
        </Text>
        <Text color="secondary">Track map unavailable for this lap.</Text>
      </div>
    );
  }

  const { points, mode, faster, speed, outlineSlot } = trackMap;

  // Orient landscape (longest extent horizontal) so every circuit reads like the
  // broadcast map instead of rotated 90°. The position-data frame differs per
  // circuit, so portrait tracks (e.g. Monza) get a quarter-turn.
  const rawW =
    Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x));
  const rawH =
    Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y));
  const oriented =
    rawH > rawW ? points.map((p) => ({ x: -p.y, y: p.x })) : points;

  const xs = oriented.map((p) => p.x);
  const ys = oriented.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const pad = Math.max(w, h) * PAD;
  const viewBox = `${minX - pad} ${minY - pad} ${w + pad * 2} ${h + pad * 2}`;

  // SVG y grows downward, data y grows upward → flip so it isn't mirrored.
  const sp = oriented.map((p) => ({ x: p.x, y: maxY + minY - p.y }));
  const heading = mode === "dominance" ? "Track dominance" : "Speed map";

  let shapes;
  if (mode === "dominance" && faster) {
    // Group consecutive same-winner points into one polyline per minisector.
    const groups = [];
    let start = 0;
    for (let i = 1; i < sp.length; i++) {
      if (faster[i] !== faster[start]) {
        groups.push({ slot: faster[start], start, end: i });
        start = i;
      }
    }
    groups.push({ slot: faster[start], start, end: sp.length - 1 });
    shapes = groups.map((g, gi) => (
      <polyline
        key={gi}
        points={sp
          .slice(g.start, g.end + 1)
          .map((p) => `${p.x},${p.y}`)
          .join(" ")}
        fill="none"
        style={{ stroke: DRIVER_COLORS[g.slot] }}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    ));
  } else if (mode === "speed" && speed) {
    const color = DRIVER_COLORS[outlineSlot];
    shapes = sp.slice(0, -1).map((p, i) => (
      <line
        key={i}
        x1={p.x}
        y1={p.y}
        x2={sp[i + 1].x}
        y2={sp[i + 1].y}
        style={{ stroke: color }}
        strokeOpacity={0.25 + 0.75 * speed[i]}
        strokeWidth={3}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    ));
  } else {
    shapes = (
      <polyline
        points={sp.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        style={{ stroke: DRIVER_COLORS[outlineSlot] ?? "var(--salt-color-gray-500)" }}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    );
  }

  const shown = drivers.filter((d) => d.status === "ok");

  return (
    <div className={styles.wrap}>
      <Text styleAs="h3" className={styles.heading}>
        {heading}
      </Text>
      {mode === "dominance" && (
        <div className={styles.legend}>
          {shown.map((d) => (
            <span key={d.driver_number} className={styles.legendItem}>
              <span
                className={styles.swatch}
                style={{ background: DRIVER_COLORS[d.slot] }}
              />
              <Text>{d.name}</Text>
            </span>
          ))}
        </div>
      )}
      <svg
        className={styles.svg}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={heading}
      >
        {shapes}
      </svg>
    </div>
  );
};

export default TrackMap;
