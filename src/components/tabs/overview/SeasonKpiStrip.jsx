import { FlexLayout } from "@salt-ds/core";
import KpiCard from "./KpiCard.jsx";
import { formatRaceDate } from "./utils/formatters.js";
import styles from "./SeasonKpiStrip.module.scss";

const SeasonKpiStrip = ({ kpis, isLoading }) => {
  const { leader, lastWinner, nextRace } = kpis;
  const empty = isLoading ? "…" : "—";
  const emptyNote = isLoading ? "" : "No races completed";

  return (
    <FlexLayout className={styles.strip} gap={3} wrap>
      <KpiCard
        label="Championship Leader"
        primary={leader ? leader.full_name : empty}
        secondary={leader ? `${leader.team_name} · ${leader.points} pts` : emptyNote}
      />
      <KpiCard
        label="Last Race Winner"
        primary={lastWinner ? lastWinner.full_name : empty}
        secondary={lastWinner ? lastWinner.meeting_name : emptyNote}
      />
      <KpiCard
        label="Next Race"
        primary={nextRace ? nextRace.meeting_name : "Season complete"}
        secondary={
          nextRace
            ? `${formatRaceDate(nextRace.date_start)} · in ${nextRace.daysUntil} days`
            : null
        }
      />
    </FlexLayout>
  );
};

export default SeasonKpiStrip;
