import { NavLink } from "react-router-dom";
import {
  DashboardIcon,
  UserIcon,
  UserGroupIcon,
  CalendarIcon,
  FlagIcon,
  ChartLineIcon,
} from "@salt-ds/icons";
import styles from "./Sidebar.module.scss";

const NAV_ITEMS = [
  { label: "Overview", icon: DashboardIcon, path: "/overview", disabled: true },
  { label: "Drivers", icon: UserIcon, path: "/drivers" },
  { label: "Teams", icon: UserGroupIcon, path: "/teams", disabled: true },
  { label: "Calendar", icon: CalendarIcon, path: "/seasons", disabled: true },
  { label: "Sessions", icon: FlagIcon, path: "/sessions", disabled: true },
  { label: "Telemetry", icon: ChartLineIcon, path: "/telemetry", disabled: true },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ label, icon: Icon, path, disabled }) => (
            <NavLink
              key={path}
              to={path}
              onClick={disabled ? (e) => e.preventDefault() : onClose}
              className={({ isActive }) =>
                [
                  styles.navItem,
                  isActive && !disabled ? styles.active : "",
                  disabled ? styles.disabled : "",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
              tabIndex={disabled ? -1 : undefined}
            >
              <Icon size={1} className={styles.navIcon} />
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
