import { MenuIcon } from "@salt-ds/icons";
import styles from "./Navbar.module.scss";
import DriverSearchBar from "./DriverSearch.jsx";
import YearSelector from "./YearSelector.jsx";
import ThemeToggle from "../../../theme/ThemeToggle.jsx";
import useTheme from "../../../theme/useTheme.js";
import logoDark from "../../../images/app-logo/f1-dashboard-logo-dark.svg";
import logoLight from "../../../images/app-logo/f1-dashboard-logo-light.svg";

// eslint-disable-next-line no-unused-vars
const Navbar = ({ onDriverSelect, onMenuClick, year, onYearChange }) => {
  const { theme } = useTheme();
  const logo = theme === "light" ? logoLight : logoDark;

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button
          className={styles.hamburger}
          onClick={onMenuClick}
          aria-label="Toggle navigation"
        >
          <MenuIcon size={1.25} />
        </button>
        <img src={logo} alt="F1 Dashboard" className={styles.brand} />
      </div>
      <div className={styles.right}>
        {/* <DriverSearchBar onDriverSelect={onDriverSelect} year={year} /> */}
        <YearSelector value={year} onChange={onYearChange} />
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Navbar;
