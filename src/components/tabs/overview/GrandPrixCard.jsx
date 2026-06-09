import { Card, Link, StackLayout, Text } from "@salt-ds/core";
import StatusPill from "./StatusPill.jsx";
import { formatWeekend } from "./utils/formatters.js";
import styles from "./GrandPrixCard.module.scss";

const GrandPrixCard = ({ gp, onOpenMeeting, onOpenSession }) => {
  const isCancelled = gp.status === "Cancelled";

  return (
    <Card className={styles.card}>
      <StackLayout gap={1}>
        <div className={styles.header}>
          <span className={styles.title}>
            <span className={styles.round}>R{gp.round}</span>
            <Link
              href={`/meetings/${gp.meeting_key}`}
              onClick={(event) => {
                event.preventDefault();
                onOpenMeeting(gp.meeting_key);
              }}
              className={styles.name}
            >
              {gp.meeting_name}
            </Link>
            {gp.country_flag && (
              <img src={gp.country_flag} alt="" className={styles.flag} />
            )}
          </span>
          <StatusPill status={gp.status} />
        </div>

        <Text color="secondary" className={styles.subheader}>
          {gp.circuit_short_name} · {formatWeekend(gp.date_start, gp.date_end)}
        </Text>

        <div className={styles.sessions}>
          {gp.sessions.map((s) => (
            <div key={s.session_key} className={styles.sessionRow}>
              {isCancelled ? (
                <Text className={styles.sessionName}>{s.session_name}</Text>
              ) : (
                <Link
                  href={`/sessions/${s.session_key}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onOpenSession(s.session_key);
                  }}
                  className={styles.sessionName}
                >
                  {s.session_name}
                </Link>
              )}
              <StatusPill status={s.status} />
            </div>
          ))}
        </div>
      </StackLayout>
    </Card>
  );
};

export default GrandPrixCard;
