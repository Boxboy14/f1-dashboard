import { Button, FlexLayout, StackLayout, Text, Tooltip } from "@salt-ds/core";
import { DownloadIcon, InfoIcon } from "@salt-ds/icons";
import TelemetryChart from "./TelemetryChart.jsx";
import { CHANNELS, DRIVER_COLORS } from "./channels.js";
import styles from "./TelemetryCharts.module.scss";

const TelemetryCharts = ({ chartData, drivers, lapLabel, onDownload }) => {
  const shown = drivers.filter((d) => d.status === "ok");

  return (
    <StackLayout gap={4} className={styles.charts}>
      <FlexLayout
        gap={3}
        align="center"
        justify="space-between"
        className={styles.legend}
      >
        <FlexLayout gap={3} align="center">
          <Text className={styles.lapLabel}>{lapLabel}</Text>
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
        <FlexLayout gap={1} align="center">
          <Tooltip content={`Download telemetry data for ${lapLabel}`}>
            <InfoIcon
              aria-label={`Download telemetry data for ${lapLabel}`}
              tabIndex={0}
            />
          </Tooltip>
          <Button
            appearance="bordered"
            onClick={onDownload}
            aria-label="Download lap summary"
          >
            <DownloadIcon aria-hidden /> Download
          </Button>
        </FlexLayout>
      </FlexLayout>

      {CHANNELS.map((channel) => (
        <TelemetryChart
          key={channel.key}
          channel={channel}
          data={chartData}
          drivers={drivers}
          lapLabel={lapLabel}
        />
      ))}
    </StackLayout>
  );
};

export default TelemetryCharts;
