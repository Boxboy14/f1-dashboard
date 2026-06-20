import { useOutletContext } from "react-router-dom";
import { Text } from "@salt-ds/core";
import DriversGrid from "../tabs/drivers/DriversGrid.jsx";
import DriverStandingsCharts from "../tabs/drivers/standings/DriverStandingsCharts.jsx";
import styles from "./HomePage.module.scss";

const HomePage = () => {
  const { openDriverInfo, year } = useOutletContext();

  return (
    <>
      <Text styleAs="h1">Drivers</Text>
      <div className={styles.layout}>
        <div className={styles.gridCol}>
          <DriversGrid year={year} onDriverOpen={openDriverInfo} />
        </div>
        <div className={styles.chartsCol}>
          <DriverStandingsCharts year={year} />
        </div>
      </div>
    </>
  );
};

export default HomePage;
