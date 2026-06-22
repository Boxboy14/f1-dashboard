import { useMemo } from "react";
import { Card, Link, StackLayout, Text } from "@salt-ds/core";
import StatusPill from "./StatusPill.jsx";
import { useSessionResult } from "../../../hooks/useOpenF1.js";
import useInView from "../../../hooks/useInView.js";
import { formatWeekend } from "./utils/formatters.js";
import styles from "./GrandPrixCard.module.scss";

const PODIUM_COLOR = {
  1: "var(--salt-color-citrine-500)",
  2: "var(--salt-color-gray-300)",
  3: "var(--salt-color-brown-500)",
};

const GrandPrixCard = ({ gp, driversByNumber, onOpenMeeting }) => {
  const [ref, inView] = useInView();

  const { data: results = [], isLoading } = useSessionResult(
    { session_key: gp.raceSessionKey },
    {
      enabled:
        inView && gp.status === "Completed" && Boolean(gp.raceSessionKey),
      meta: { background: true },
    },
  );

  const podium = useMemo(
    () =>
      [...results]
        .filter((r) => r.position >= 1 && r.position <= 3)
        .sort((a, b) => a.position - b.position)
        .map((r) => {
          const driver = driversByNumber.get(r.driver_number);
          return {
            position: r.position,
            full_name: driver?.full_name ?? `#${r.driver_number}`,
            team_name: driver?.team_name ?? "",
          };
        }),
    [results, driversByNumber],
  );

  const showPlaceholder = !inView || isLoading;

  return (
    <div ref={ref} className={styles.cardWrap}>
      <Card className={styles.card}>
        <StackLayout gap={1} className={styles.stack}>
          <div className={styles.header}>
            <span className={styles.title}>
              <span className={styles.round}>R{gp.round}</span>
              <Text styleAs="h3" className={styles.name}>
                {gp.meeting_name}
              </Text>
              {gp.country_flag && (
                <img src={gp.country_flag} alt="" className={styles.flag} />
              )}
            </span>
            <StatusPill status={gp.status} />
          </div>

          <Text color="secondary" className={styles.subheader}>
            {gp.circuit_short_name} ·{" "}
            {formatWeekend(gp.date_start, gp.date_end)}
          </Text>

          <div className={styles.podium}>
            {showPlaceholder ? (
              <Text color="secondary" className={styles.podiumNote}>
                Loading results…
              </Text>
            ) : podium.length ? (
              podium.map((p) => (
                <div key={p.position} className={styles.podiumRow}>
                  <span
                    className={styles.pos}
                    style={{ background: PODIUM_COLOR[p.position] }}
                  >
                    {p.position}
                  </span>
                  <Text className={styles.driver}>{p.full_name}</Text>
                  <Text color="secondary" className={styles.team}>
                    {p.team_name}
                  </Text>
                </div>
              ))
            ) : (
              <Text color="secondary" className={styles.podiumNote}>
                Results not available
              </Text>
            )}
          </div>

          <Link
            href={`/meetings/${gp.meeting_key}`}
            onClick={(event) => {
              event.preventDefault();
              onOpenMeeting(gp.meeting_key);
            }}
            className={styles.viewLink}
            style={{
              color: "var(--salt-color-blue-300)",
              textDecoration: "none",
            }}
          >
            Click to view all sessions
          </Link>
        </StackLayout>
      </Card>
    </div>
  );
};

export default GrandPrixCard;
