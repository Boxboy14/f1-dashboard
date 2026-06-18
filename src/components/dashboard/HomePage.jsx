import { useOutletContext } from "react-router-dom";
import { Text } from "@salt-ds/core";
import DriversGrid from "../tabs/drivers/DriversGrid.jsx";

const HomePage = () => {
  const { openDriverInfo, year } = useOutletContext();

  return (
    <>
      <Text styleAs="h1">Drivers</Text>
      <DriversGrid year={year} onDriverOpen={openDriverInfo} />
    </>
  );
};

export default HomePage;
