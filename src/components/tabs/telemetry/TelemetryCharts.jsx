import { FlexLayout, StackLayout, Text } from "@salt-ds/core";
import TelemetryChart from "./TelemetryChart.jsx";
import { CHANNELS, DRIVER_COLORS } from "./channels.js";
import styles from "./TelemetryCharts.module.scss";

const TelemetryCharts = ({ chartData, drivers }) => {
  const shown = drivers.filter((d) => d.status === "ok");

  return (
    <StackLayout gap={0} className={styles.charts}>
      <FlexLayout gap={3} className={styles.legend}>
        {shown.map((d) => (
          <span key={d.driver_number} className={styles.legendItem}>
            <span
              className={styles.swatch}
              style={{ background: DRIVER_COLORS[d.slot] }}
            />
            <Text>{d.name}</Text>
          </span>
        ))}
      </FlexLayout>

      {CHANNELS.map((channel) => (
        <TelemetryChart
          key={channel.key}
          channel={channel}
          data={chartData}
          drivers={drivers}
        />
      ))}
    </StackLayout>
  );
};

export default TelemetryCharts;
