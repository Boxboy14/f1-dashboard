import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setDrivers } from "../../store/drivers/driverSlice.js";
import { DRIVERS_BASE_URL } from "../../services/api/baseUrls.js";
import Navbar from "./Navbar/Navbar.jsx";
import DriversGrid from "./DriversGrid/DriversGrid.jsx";

const HomePage = () => {
  const dispatch = useDispatch();

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
  });

  return (
    <>
      <Navbar />
      <DriversGrid />
    </>
  );
};

export default HomePage;
