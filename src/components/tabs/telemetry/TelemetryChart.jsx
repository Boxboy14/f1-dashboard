import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { DRIVER_COLORS } from "./channels.js";
import styles from "./TelemetryChart.module.scss";

const AXIS = "#8b8f97";
const GRID = "#2a2a2a";
const LABEL = "#cbd5e1";

const TelemetryChart = ({ channel, data, drivers, lapLabel }) => {
  const lines = drivers.filter((d) => d.status === "ok");
  const type = channel.lineType === "step" ? "stepAfter" : "monotone";
  const axisTitle = channel.unit
    ? `${channel.label} (${channel.unit})`
    : channel.label;

  return (
    <div className={styles.chart}>
      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={data} syncId="telemetry" margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="distance"
            stroke={AXIS}
            tick={{ fontSize: 11, fill: AXIS }}
            unit="m"
          />
          <YAxis
            domain={channel.domain}
            stroke={AXIS}
            tick={{ fontSize: 11, fill: AXIS }}
            width={72}
            allowDecimals={false}
            label={{
              value: axisTitle,
              angle: -90,
              position: "insideLeft",
              style: {
                textAnchor: "middle",
                fill: LABEL,
                fontSize: 12,
                fontWeight: 600,
              },
            }}
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
