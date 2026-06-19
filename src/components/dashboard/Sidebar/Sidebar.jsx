import { NavLink, useSearchParams } from "react-router-dom";
import { Button, Tooltip } from "@salt-ds/core";
import {
  DashboardIcon,
  UserIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartLineIcon,
  DoubleChevronLeftIcon,
  DoubleChevronRightIcon,
} from "@salt-ds/icons";
import styles from "./Sidebar.module.scss";

const NAV_ITEMS = [
  { label: "Overview", icon: DashboardIcon, path: "/overview" },
  { label: "Drivers", icon: UserIcon, path: "/drivers" },
  { label: "Teams", icon: UserGroupIcon, path: "/teams" },
  { label: "Calendar", icon: CalendarIcon, path: "/seasons" },
  { label: "Telemetry", icon: ChartLineIcon, path: "/telemetry" },
];

const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const [searchParams] = useSearchParams();
  const year = searchParams.get("year");

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside
        className={[
          styles.sidebar,
          isOpen ? styles.open : "",
          collapsed ? styles.collapsed : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ label, icon: Icon, path, disabled }) => {
            const link = (
              <NavLink
                to={{ pathname: path, search: year ? `year=${year}` : "" }}
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
            );
            // Collapsed rail hides labels, so surface the tab name on hover.
            return collapsed ? (
              <Tooltip key={path} content={label} placement="right">
                {link}
              </Tooltip>
            ) : (
              <div key={path}>{link}</div>
            );
          })}
        </nav>
        <div className={styles.footer}>
          <Button
            appearance="transparent"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <DoubleChevronRightIcon /> : <DoubleChevronLeftIcon />}
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
