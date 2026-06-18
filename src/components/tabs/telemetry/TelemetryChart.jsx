import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { DRIVER_COLOR_VARS } from "./channels.js";
import { cssColor } from "../../../theme/cssColor.js";
import styles from "./TelemetryChart.module.scss";

// Axis lines, grid, and tick labels are themed via global CSS (see index.css),
// since Recharts sets those as SVG attributes that don't resolve var().
const LABEL_FILL = "var(--salt-content-secondary-foreground)";
const TOOLTIP_BG = "var(--salt-container-primary-background)";
const TOOLTIP_BORDER = "var(--salt-separable-secondary-borderColor)";

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
          <CartesianGrid vertical={false} />
          <XAxis dataKey="distance" tick={{ fontSize: 11 }} unit="m" />
          <YAxis
            domain={channel.domain}
            tick={{ fontSize: 11 }}
            width={72}
            allowDecimals={false}
            label={{
              value: axisTitle,
              angle: -90,
              position: "insideLeft",
              style: {
                textAnchor: "middle",
                fill: LABEL_FILL,
                fontSize: 12,
                fontWeight: 600,
              },
            }}
          />
          <Tooltip
            contentStyle={{
              background: TOOLTIP_BG,
              border: `1px solid ${TOOLTIP_BORDER}`,
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
              stroke={cssColor(DRIVER_COLOR_VARS[d.slot])}
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
