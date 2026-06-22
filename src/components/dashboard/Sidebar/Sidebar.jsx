import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import { Button, Tooltip } from "@salt-ds/core";
import {
  DashboardIcon,
  UserIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartLineIcon,
  HelpIcon,
  FeedbackIcon,
  DoubleChevronLeftIcon,
  DoubleChevronRightIcon,
} from "@salt-ds/icons";
import styles from "./Sidebar.module.scss";

const NAV_ITEMS = [
  { label: "Overview", icon: DashboardIcon, path: "/overview" },
  { label: "Drivers", icon: UserIcon, path: "/drivers" },
  { label: "Teams", icon: UserGroupIcon, path: "/teams" },
  {
    label: "Calendar",
    icon: CalendarIcon,
    path: "/seasons",
    match: ["/seasons", "/meetings", "/sessions"],
  },
  { label: "Telemetry", icon: ChartLineIcon, path: "/telemetry" },
];

const HOW_TO_USE_ITEM = { label: "How to Use", icon: HelpIcon, path: "/how-to-use" };
const FEEDBACK_ITEM = { label: "Feedback", icon: FeedbackIcon, path: "/feedback" };

const isPathActive = (pathname, prefixes) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const year = searchParams.get("year");

  const renderItem = ({ label, icon: Icon, path, disabled, match }) => {
    const active = isPathActive(pathname, match ?? [path]);
    const link = (
      <NavLink
        to={{ pathname: path, search: year ? `year=${year}` : "" }}
        onClick={disabled ? (e) => e.preventDefault() : onClose}
        className={[
          styles.navItem,
          active && !disabled ? styles.active : "",
          disabled ? styles.disabled : "",
        ]
          .filter(Boolean)
          .join(" ")}
        tabIndex={disabled ? -1 : undefined}
      >
        <Icon size={1} className={styles.navIcon} />
        <span className={styles.navLabel}>{label}</span>
      </NavLink>
    );
    return collapsed ? (
      <Tooltip key={path} content={label} placement="right">
        {link}
      </Tooltip>
    ) : (
      <div key={path}>{link}</div>
    );
  };

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
        <nav className={styles.nav}>{NAV_ITEMS.map(renderItem)}</nav>
        <nav className={styles.bottomNav}>
          {renderItem(HOW_TO_USE_ITEM)}
          {renderItem(FEEDBACK_ITEM)}
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
