import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar.jsx";
import DriverInfoCard from "../DriversGrid/DriverInfoCard.jsx";

const DashboardLayout = () => {
  const [selectedDriver, setSelectedDriver] = useState(undefined);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

  const openDriverInfo = (driver) => {
    if (!driver) {
      return;
    }

    setSelectedDriver(driver);
    setIsInfoDialogOpen(true);
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
        isOpen={isInfoDialogOpen}
        setIsInfoDialogOpen={setIsInfoDialogOpen}
      />
    </>
  );
};

export default DashboardLayout;
