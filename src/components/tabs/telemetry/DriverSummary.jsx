import { Card, FlexLayout, Text } from "@salt-ds/core";
import { DRIVER_COLORS } from "./channels.js";
import { formatLapTime } from "../../../utils/telemetry.js";
import styles from "./DriverSummary.module.scss";

const STATUS_NOTE = {
  "no-lap": "No timed lap in this session",
  "no-telemetry": "No telemetry for this lap",
};

const DriverSummary = ({ drivers }) => (
  <FlexLayout gap={2} className={styles.summary} wrap>
    {drivers.map((d) => (
      <Card key={d.driver_number} className={styles.card}>
        <span className={styles.name} style={{ color: DRIVER_COLORS[d.slot] }}>
          {d.name}
        </span>
        {d.status === "ok" ? (
          <span className={styles.stats}>
            <Text>Fastest lap {formatLapTime(d.lapTime)}</Text>
            <Text>Top speed {d.topSpeed} km/h</Text>
          </span>
        ) : (
          <Text color="secondary">{STATUS_NOTE[d.status] ?? "—"}</Text>
        )}
      </Card>
    ))}
  </FlexLayout>
);

export default DriverSummary;
