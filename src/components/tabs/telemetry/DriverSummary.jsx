import { Card, GridLayout, Text } from "@salt-ds/core";
import { DRIVER_COLORS } from "./channels.js";
import { formatLapTime } from "../../../utils/telemetry.js";
import { titleCaseCompound } from "../../../utils/telemetry/tyres.js";
import TyreIcon from "./TyreIcon.jsx";
import styles from "./DriverSummary.module.scss";

const STATUS_NOTE = {
  "no-lap": "No timed lap in this session",
  "no-telemetry": "No telemetry for this lap",
};

const fmtSector = (s) => (s == null ? "–" : s.toFixed(3));
const fmtTyreAge = (n) => (n == null ? null : `${n} lap${n === 1 ? "" : "s"}`);
const hasSectors = (s) => s && (s.s1 != null || s.s2 != null || s.s3 != null);

const hdPhoto = (url) =>
  url && url.includes("1col") ? url.replace("1col", "4col") : url;

const DriverSummary = ({ drivers }) => (
  <GridLayout columns={{ xs: 1, sm: 2 }} gap={2} className={styles.summary}>
    {drivers.map((d) => {
      const accent = DRIVER_COLORS[d.slot];
      const comparing = d.delta != null;
      const isFastest = d.delta === 0;
      const highlightLap = isFastest || !comparing;
      return (
        <Card
          key={d.driver_number}
          className={styles.card}
          style={{ "--accent": accent }}
        >
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
            <div className={styles.header}>
              <div className={styles.identity}>
                <span className={styles.name}>{d.name}</span>
                <span className={styles.team}>{d.team_name}</span>
              </div>

              {d.status === "ok" && (
                <div className={styles.lapBlock}>
                  <span className={styles.lapLabel}>Lap time</span>
                  <span
                    className={styles.lapValue}
                    data-highlight={highlightLap}
                  >
                    {formatLapTime(d.lapTime)}
                  </span>
                  {comparing &&
                    (isFastest ? (
                      <span className={styles.fastest}>Fastest</span>
                    ) : (
                      <span className={styles.delta}>
                        +{d.delta.toFixed(3)}s
                      </span>
                    ))}
                </div>
              )}
            </div>

            {d.status === "ok" ? (
              <>
                <div className={styles.divider} />
                <div className={styles.statsRow}>
                  {hasSectors(d.sectors) && (
                    <div className={styles.statCol}>
                      <span className={styles.statLabel}>Sectors</span>
                      <span className={`${styles.statValue} ${styles.sectors}`}>
                        {fmtSector(d.sectors.s1)} · {fmtSector(d.sectors.s2)} ·{" "}
                        {fmtSector(d.sectors.s3)}
                      </span>
                    </div>
                  )}
                  <div className={styles.statCol}>
                    <span className={styles.statLabel}>Top speed</span>
                    <span className={styles.statValue}>
                      <strong className={styles.bigNum}>{d.topSpeed}</strong>
                      <span className={styles.unit}>km/h</span>
                    </span>
                  </div>
                  <div className={styles.statCol}>
                    <span className={styles.statLabel}>Tyre</span>
                    {d.compound ? (
                      <span className={styles.statValue}>
                        <TyreIcon compound={d.compound} size={18} />
                        {titleCaseCompound(d.compound)}
                        {fmtTyreAge(d.tyreAge) && (
                          <span className={styles.unit}>
                            · {fmtTyreAge(d.tyreAge)}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className={styles.statUnavailable}>Unavailable</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <Text color="secondary" className={styles.statusNote}>
                {STATUS_NOTE[d.status] ?? "—"}
              </Text>
            )}
          </div>
        </Card>
      );
    })}
  </GridLayout>
);

export default DriverSummary;
