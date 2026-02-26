import { useCallback, useMemo } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { createDriverSlug } from "../../../store/drivers/utils.js";
import Navbar from "../Navbar/Navbar.jsx";
import DriverInfoCard from "../DriversGrid/DriverInfoCard.jsx";
import { useSelector } from "react-redux";
import { driverSelector } from "../../../store/drivers/selector.js";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { driverSlug } = useParams();
  const drivers = useSelector(driverSelector);

  const selectedDriver = useMemo(() => {
    if (!driverSlug) {
      return undefined;
    }

    return drivers.find((driver) => createDriverSlug(driver) === driverSlug);
  }, [driverSlug, drivers]);

  const openDriverInfo = useCallback(
    (driver) => {
      if (!driver) {
        return;
      }

      const driverSlug = createDriverSlug(driver);
      if (driverSlug) {
        navigate(`/drivers/${driverSlug}`);
      }
    },
    [navigate],
  );

  const handleInfoDialogOpenChange = (isOpen) => {
    if (!isOpen) {
      navigate("/drivers");
    }
  };

  const dialogId = useMemo(() => {
    if (!selectedDriver) {
      return "driver-info-dialog";
    }

    return `${selectedDriver.first_name}-${selectedDriver.driver_number}`;
  }, [selectedDriver]);

  return (
    <>
      <Navbar onDriverSelect={openDriverInfo} />
      <Outlet context={{ openDriverInfo }} />
      <DriverInfoCard
        driverData={selectedDriver}
        id={dialogId}
        isOpen={Boolean(driverSlug && selectedDriver)}
        setIsInfoDialogOpen={handleInfoDialogOpenChange}
      />
    </>
  );
};

export default DashboardLayout;
