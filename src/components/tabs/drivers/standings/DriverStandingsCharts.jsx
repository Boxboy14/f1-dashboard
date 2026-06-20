import { CircularProgress, Text } from "@salt-ds/core";
import { useDriverStandingsEvolution } from "../../../../hooks/useDriverStandingsEvolution.js";
import PointsEvolutionChart from "./PointsEvolutionChart.jsx";
import RankingEvolutionChart from "./RankingEvolutionChart.jsx";
import styles from "./DriverStandingsCharts.module.scss";

const DriverStandingsCharts = ({ year }) => {
  const {
    rounds,
    drivers,
    pointsData,
    rankData,
    driverCount,
    isLoading,
    isEmpty,
  } = useDriverStandingsEvolution(year);

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
      <PointsEvolutionChart rounds={rounds} drivers={drivers} data={pointsData} />
      <RankingEvolutionChart
        rounds={rounds}
        drivers={drivers}
        data={rankData}
        driverCount={driverCount}
      />
    </div>
  );
};

export default DriverStandingsCharts;
