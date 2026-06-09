import { GridLayout } from "@salt-ds/core";
import GrandPrixCard from "./GrandPrixCard.jsx";
import styles from "./GrandPrixCardGrid.module.scss";

const GrandPrixCardGrid = ({ grandPrix, onOpenMeeting, onOpenSession }) => (
  <GridLayout
    className={styles.grid}
    columns={{ xs: 1, sm: 2, lg: 3 }}
    gap={3}
  >
    {grandPrix.map((gp) => (
      <GrandPrixCard
        key={gp.meeting_key}
        gp={gp}
        onOpenMeeting={onOpenMeeting}
        onOpenSession={onOpenSession}
      />
    ))}
  </GridLayout>
);

export default GrandPrixCardGrid;
