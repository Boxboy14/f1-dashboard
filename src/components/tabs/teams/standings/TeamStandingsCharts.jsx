import { CircularProgress, Text } from "@salt-ds/core";
import { useTeamStandingsEvolution } from "../../../../hooks/useTeamStandingsEvolution.js";
import PointsEvolutionChart from "./PointsEvolutionChart.jsx";
import RankingEvolutionChart from "./RankingEvolutionChart.jsx";
import styles from "./TeamStandingsCharts.module.scss";

const TeamStandingsCharts = ({ year }) => {
  const { rounds, teams, pointsData, rankData, teamCount, isLoading, isEmpty } =
    useTeamStandingsEvolution(year);

  if (isEmpty) {
    return (
      <Text color="secondary" className={styles.message}>
        Standings will appear after the first race.
      </Text>
    );
  }
  if (isLoading) {
    return <CircularProgress aria-label="Loading standings" />;
  }

  return (
    <div className={styles.charts}>
      <PointsEvolutionChart rounds={rounds} teams={teams} data={pointsData} />
      <RankingEvolutionChart
        rounds={rounds}
        teams={teams}
        data={rankData}
        teamCount={teamCount}
      />
    </div>
  );
};

export default TeamStandingsCharts;
