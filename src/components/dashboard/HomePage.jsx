import { useOutletContext } from "react-router-dom";
import DriversGrid from "./DriversGrid/DriversGrid.jsx";

const HomePage = () => {
  const { openDriverInfo } = useOutletContext();
  return <DriversGrid onDriverOpen={openDriverInfo} />;
};

export default HomePage;
