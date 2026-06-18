import { Card, GridLayout, Text } from "@salt-ds/core";
import { DRIVER_COLORS } from "./channels.js";
import { formatLapTime } from "../../../utils/telemetry.js";
import styles from "./DriverSummary.module.scss";

const STATUS_NOTE = {
  "no-lap": "No timed lap in this session",
  "no-telemetry": "No telemetry for this lap",
};

// OpenF1 headshots default to a small "1col" transform; request a larger one
// when the pattern is present, falling back to the original if it 404s.
const hdPhoto = (url) =>
  url && url.includes("1col") ? url.replace("1col", "4col") : url;

const DriverSummary = ({ drivers }) => (
  <GridLayout columns={{ xs: 1, sm: 2 }} gap={2} className={styles.summary}>
    {drivers.map((d) => (
      <Card key={d.driver_number} className={styles.card}>
        <div className={styles.photoWrap}>
          {d.headshot_url ? (
            <img
              src={hdPhoto(d.headshot_url)}
              alt={d.name}
              className={styles.photo}
              onError={(e) => {
                if (e.currentTarget.src !== d.headshot_url) {
                  e.currentTarget.src = d.headshot_url;
                }
              }}
            />
          ) : (
            <span className={styles.photoFallback}>#{d.driver_number}</span>
          )}
        </div>

        <div className={styles.info}>
          <Text
            styleAs="h2"
            className={styles.name}
            style={{ color: DRIVER_COLORS[d.slot] }}
          >
            {d.name}
          </Text>
          <Text color="secondary" className={styles.team}>
            {d.team_name}
          </Text>

          {d.status === "ok" ? (
            <div className={styles.stats}>
              <Text>
                Fastest lap <strong>{formatLapTime(d.lapTime)}</strong>
              </Text>
              <Text>
                Top speed <strong>{d.topSpeed} km/h</strong>
              </Text>
            </div>
          ) : (
            <Text color="secondary" className={styles.stats}>
              {STATUS_NOTE[d.status] ?? "—"}
            </Text>
          )}
        </div>
      </Card>
    ))}
  </GridLayout>
);

export default DriverSummary;
