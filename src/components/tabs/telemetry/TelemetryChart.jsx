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
import { DRIVER_COLORS } from "./channels.js";
import styles from "./TelemetryChart.module.scss";

const AXIS = "#8b8f97";
const GRID = "#2a2a2a";

const TelemetryChart = ({ channel, data, drivers, lapLabel }) => {
  const lines = drivers.filter((d) => d.status === "ok");
  const type = channel.lineType === "step" ? "stepAfter" : "monotone";

  return (
    <div className={styles.chart}>
      <Text styleAs="label" className={styles.title}>
        {channel.label}
        {channel.unit ? ` (${channel.unit})` : ""}
      </Text>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart
          data={data}
          syncId="telemetry"
          margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="distance"
            stroke={AXIS}
            tick={{ fontSize: 11, fill: AXIS }}
            tickFormatter={(d) => `${d}`}
            unit="m"
          />
          <YAxis
            domain={channel.domain}
            stroke={AXIS}
            tick={{ fontSize: 11, fill: AXIS }}
            width={44}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: `1px solid ${GRID}`,
              borderRadius: 6,
            }}
            labelFormatter={(d) => `${lapLabel} · ${d} m`}
          />
          {lines.map((d) => (
            <Line
              key={d.driver_number}
              type={type}
              dataKey={`${channel.key}_${d.suffix}`}
              name={d.name}
              stroke={DRIVER_COLORS[d.slot]}
              strokeWidth={1.6}
              strokeOpacity={0.9}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TelemetryChart;
