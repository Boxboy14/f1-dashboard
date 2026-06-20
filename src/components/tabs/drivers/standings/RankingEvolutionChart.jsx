import { useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Text } from "@salt-ds/core";
import FlagAxisTick from "./FlagAxisTick.jsx";
import styles from "./DriverStandingsCharts.module.scss";

const TOOLTIP_BG = "var(--salt-container-primary-background)";
const TOOLTIP_BORDER = "var(--salt-separable-secondary-borderColor)";

const MARGIN = { top: 8, right: 44, bottom: 24, left: 8 };
const X_AXIS_H = 28;
const Y_AXIS_W = 28;
const X_PAD = 12; // keeps the first/last flag off the axis lines

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

// Single-driver panel for the hovered line: name + position post that round.
// `label`/`payload` come from Recharts (the active round + every line's value);
// `hovered` (which driver) is supplied by the chart's own cursor tracking.
const RankTooltip = ({ active, payload, label, rounds, drivers, hovered }) => {
  if (!active || hovered == null) return null;
  const round = rounds.find((r) => r.round === label);
  const d = drivers.find((x) => x.driverNumber === hovered);
  const entry = payload?.find((p) => p.dataKey === `d${hovered}`);
  if (!d) return null;

  return (
    <div
      className={styles.tooltip}
      style={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}` }}
    >
      <div className={styles.tooltipHead}>
        {round?.countryFlag && (
          <img src={round.countryFlag} alt="" className={styles.tooltipFlag} />
        )}
        <span className={styles.tooltipCountry}>{round?.countryName}</span>
        <span className={styles.tooltipRound}>R{label}</span>
      </div>
      {entry?.value != null && (
        <div className={styles.tooltipRow}>
          <span className={styles.tooltipName} style={{ color: d.color }}>
            {d.name}
          </span>
          <span className={styles.tooltipVal}>{ordinal(entry.value)} pos.</span>
        </div>
      )}
    </div>
  );
};

const RankingEvolutionChart = ({ rounds, drivers, data, driverCount }) => {
  const [hovered, setHovered] = useState(null);
  const wrapRef = useRef(null);
  const lastIndex = data.length - 1;
  const height = Math.max(380, driverCount * 22);
  const posTicks = Array.from({ length: driverCount }, (_, i) => i + 1);

  // Recharts 3's mouse-move state no longer carries the cursor coordinate, so we
  // detect the hovered line entirely from the DOM event + data + plot geometry:
  // map cursor X → active round and cursor Y → fractional position, then pick the
  // driver whose position that round is nearest. Robust where lines cross.
  const detect = (clientX, clientY) => {
    const el = wrapRef.current;
    if (!el || !data.length) return;
    const rect = el.getBoundingClientRect();
    const plotLeft = MARGIN.left + Y_AXIS_W + X_PAD;
    const plotRight = rect.width - MARGIN.right - X_PAD;
    const plotTop = MARGIN.top;
    const plotBottom = rect.height - MARGIN.bottom - X_AXIS_H;

    const xFrac = (clientX - rect.left - plotLeft) / (plotRight - plotLeft || 1);
    const idx = Math.max(
      0,
      Math.min(data.length - 1, Math.round(xFrac * (data.length - 1))),
    );
    const row = data[idx];

    const yFrac = (clientY - rect.top - plotTop) / (plotBottom - plotTop || 1);
    const estPos = 1 + yFrac * (driverCount - 1);

    let best = null;
    let bestDist = Infinity;
    for (const d of drivers) {
      const v = row[`d${d.driverNumber}`];
      if (v == null) continue;
      const dist = Math.abs(v - estPos);
      if (dist < bestDist) {
        bestDist = dist;
        best = d.driverNumber;
      }
    }
    setHovered(best);
  };

  return (
    <div className={styles.panel}>
      <Text styleAs="h3" className={styles.title}>
        Driver Ranking Evolution
      </Text>
      <div
        ref={wrapRef}
        onMouseMove={(e) => detect(e.clientX, e.clientY)}
        onMouseLeave={() => setHovered(null)}
      >
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={MARGIN}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="round"
              interval={0}
              height={X_AXIS_H}
              padding={{ left: X_PAD, right: X_PAD }}
              tickLine={false}
              tick={<FlagAxisTick rounds={rounds} />}
            />
            <YAxis
              reversed
              domain={[1, driverCount]}
              ticks={posTicks}
              interval={0}
              allowDecimals={false}
              width={Y_AXIS_W}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={
                <RankTooltip
                  rounds={rounds}
                  drivers={drivers}
                  hovered={hovered}
                />
              }
              wrapperStyle={{ outline: "none" }}
            />
            {drivers.map((d) => {
              const isHover = hovered === d.driverNumber;
              const dim = hovered != null && !isHover;
              return (
                <Line
                  key={d.driverNumber}
                  type="monotone"
                  dataKey={`d${d.driverNumber}`}
                  name={d.name}
                  stroke={d.color}
                  strokeWidth={isHover ? 4 : 2}
                  strokeOpacity={dim ? 0.2 : 1}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                  label={(props) => {
                    if (props.index !== lastIndex || props.value == null) {
                      return null;
                    }
                    return (
                      <text
                        key={`lbl-${d.driverNumber}`}
                        x={props.x + 6}
                        y={props.y}
                        dy={4}
                        fontSize={11}
                        fontWeight={700}
                        fill={d.color}
                        fillOpacity={dim ? 0.25 : 1}
                      >
                        {d.code}
                      </text>
                    );
                  }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RankingEvolutionChart;
