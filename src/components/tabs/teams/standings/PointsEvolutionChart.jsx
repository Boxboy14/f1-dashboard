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
import styles from "./TeamStandingsCharts.module.scss";

const TOOLTIP_BG = "var(--salt-container-primary-background)";
const TOOLTIP_BORDER = "var(--salt-separable-secondary-borderColor)";

const PointsTooltip = ({ active, payload, label, rounds, teams }) => {
  if (!active || !payload?.length) return null;
  const round = rounds.find((r) => r.round === label);
  const metaByKey = new Map(teams.map((t) => [t.key, t]));
  const orderByKey = new Map(teams.map((t, i) => [t.key, i]));
  const ranked = payload
    .filter((p) => p.value != null)
    .map((p) => {
      const key = p.dataKey.slice(2);
      const t = metaByKey.get(key);
      return { key, points: p.value, name: t?.teamName ?? key, color: t?.color };
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        (orderByKey.get(a.key) ?? 99) - (orderByKey.get(b.key) ?? 99),
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
          <li key={r.key} className={styles.tooltipRow}>
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

const PointsEvolutionChart = ({ rounds, teams, data }) => (
  <div className={styles.panel}>
    <Text styleAs="h3" className={styles.title}>
      Team Points Evolution
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
          content={<PointsTooltip rounds={rounds} teams={teams} />}
          wrapperStyle={{ outline: "none" }}
        />
        {teams.map((t) => (
          <Line
            key={t.key}
            type="monotone"
            dataKey={`t_${t.key}`}
            name={t.teamName}
            stroke={t.color}
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
