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

// Axis/grid are themed by the global Recharts CSS (index.css); tooltip surface
// uses Salt token strings (var() resolves in inline style / CSS).
const TOOLTIP_BG = "var(--salt-container-primary-background)";
const TOOLTIP_BORDER = "var(--salt-separable-secondary-borderColor)";

// Hovering a round → every driver's cumulative points that round, ranked
// high→low (ties broken by championship order, which `drivers` is sorted by).
const PointsTooltip = ({ active, payload, label, rounds, drivers }) => {
  if (!active || !payload?.length) return null;
  const round = rounds.find((r) => r.round === label);
  const metaByDn = new Map(drivers.map((d) => [d.driverNumber, d]));
  const orderByDn = new Map(drivers.map((d, i) => [d.driverNumber, i]));
  const ranked = payload
    .filter((p) => p.value != null)
    .map((p) => {
      const dn = Number(p.dataKey.slice(1));
      const d = metaByDn.get(dn);
      return { dn, points: p.value, name: d?.name ?? `#${dn}`, color: d?.color };
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        (orderByDn.get(a.dn) ?? 99) - (orderByDn.get(b.dn) ?? 99),
    );

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
      <ol className={styles.tooltipList}>
        {ranked.map((r, i) => (
          <li key={r.dn} className={styles.tooltipRow}>
            <span className={styles.tooltipPos}>{i + 1}.</span>
            <span className={styles.tooltipName} style={{ color: r.color }}>
              {r.name}
            </span>
            <span className={styles.tooltipVal}>{r.points}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

const PointsEvolutionChart = ({ rounds, drivers, data }) => (
  <div className={styles.panel}>
    <Text styleAs="h3" className={styles.title}>
      Driver Points Evolution
    </Text>
    <ResponsiveContainer width="100%" height={380}>
      <LineChart data={data} margin={{ top: 8, right: 20, bottom: 24, left: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="round"
          interval={0}
          height={28}
          padding={{ left: 12, right: 12 }}
          tickLine={false}
          tick={<FlagAxisTick rounds={rounds} />}
        />
        <YAxis allowDecimals={false} width={44} tick={{ fontSize: 12 }} />
        <Tooltip
          content={<PointsTooltip rounds={rounds} drivers={drivers} />}
          wrapperStyle={{ outline: "none" }}
        />
        {drivers.map((d) => (
          <Line
            key={d.driverNumber}
            type="monotone"
            dataKey={`d${d.driverNumber}`}
            name={d.name}
            stroke={d.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default PointsEvolutionChart;
