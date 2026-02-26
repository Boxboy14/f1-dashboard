import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { setDrivers } from "../../store/drivers/driverSlice.js";
import { DRIVERS_BASE_URL } from "../../services/api/baseUrls.js";
import DriversGrid from "./DriversGrid/DriversGrid.jsx";

const HomePage = () => {
  const dispatch = useDispatch();
  const { openDriverInfo } = useOutletContext();

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch(DRIVERS_BASE_URL);
        const data = await response.json();
        if (data.length) {
          dispatch(setDrivers(data));
        }
      } catch (error) {
        console.error("Failed to fetch drivers:", error);
      }
    };

    fetchDrivers();
  }, [dispatch]);

  return <DriversGrid onDriverOpen={openDriverInfo} />;
};

export default HomePage;
