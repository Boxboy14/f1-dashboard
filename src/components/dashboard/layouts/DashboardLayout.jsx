import { useCallback, useMemo, useState } from "react";
import {
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { createDriverSlug } from "../../../store/drivers/utils.js";
import Navbar from "../Navbar/Navbar.jsx";
import Sidebar from "../Sidebar/Sidebar.jsx";
import DriverInfoCard from "../../tabs/drivers/DriverInfoCard.jsx";
import { useDriversByYear } from "../../../hooks/useOpenF1.js";
import styles from "./DashboardLayout.module.scss";

const DEFAULT_SEASON = 2025;

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { driverSlug } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const year = Number(searchParams.get("year") ?? DEFAULT_SEASON);
  const { data: drivers = [] } = useDriversByYear(year);
  const handleYearChange = (newYear) =>
    setSearchParams({ year: String(newYear) });

  const selectedDriver = useMemo(() => {
    if (!driverSlug) return undefined;
    return drivers.find((driver) => createDriverSlug(driver) === driverSlug);
  }, [driverSlug, drivers]);

  const openDriverInfo = useCallback(
    (driver) => {
      if (!driver) return;
      const slug = createDriverSlug(driver);
      if (slug) navigate({ pathname: `/drivers/${slug}`, search: searchParams.toString() });
    },
    [navigate, searchParams],
  );

  const handleInfoDialogOpenChange = (isOpen) => {
    if (!isOpen) navigate({ pathname: "/drivers", search: searchParams.toString() });
  };

  const dialogId = useMemo(
    () =>
      selectedDriver
        ? `${selectedDriver.first_name}-${selectedDriver.driver_number}`
        : "driver-info-dialog",
    [selectedDriver],
  );

  return (
    <div className={styles.shell}>
      <Navbar
        onDriverSelect={openDriverInfo}
        onMenuClick={() => setSidebarOpen((prev) => !prev)}
        year={year}
        onYearChange={handleYearChange}
      />
      <div className={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={styles.content}>
          <Outlet context={{ openDriverInfo, year }} />
        </main>
      </div>
      <DriverInfoCard
        driverData={selectedDriver}
        id={dialogId}
        isOpen={Boolean(driverSlug && selectedDriver)}
        setIsInfoDialogOpen={handleInfoDialogOpenChange}
      />
    </div>
  );
};

export default DashboardLayout;
