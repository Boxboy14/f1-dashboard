import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setDrivers } from "../../store/drivers/driverSlice.js";
import { DRIVERS_BASE_URL } from "../../services/api/baseUrls.js";

const HomePage = () => {
  const [driverData, setDriverData] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const response = await fetch(DRIVERS_BASE_URL);
        const data = await response.json();
        setDriverData(data);
        if (data.length) {
          dispatch(setDrivers(data));
        }
      } catch (error) {
        console.error("Failed to fetch drivers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [dispatch]);

  return (
    <>
      <h3>Drivers Dashboard : {driverData.length}</h3>
      {loading && <p>Loading drivers data...</p>}
    </>
  );
};

export default HomePage;
