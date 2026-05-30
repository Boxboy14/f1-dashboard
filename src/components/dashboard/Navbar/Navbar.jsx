import { MenuIcon } from "@salt-ds/icons";
import styles from "./Navbar.module.scss";
import DriverSearchBar from "./DriverSearch.jsx";
import YearSelector from "./YearSelector.jsx";

const Navbar = ({ onDriverSelect, onMenuClick, year, onYearChange }) => {
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
        <div className={styles.brand}>F1 Dashboard</div>
      </div>
      <div className={styles.right}>
        <DriverSearchBar onDriverSelect={onDriverSelect} />
        <YearSelector value={year} onChange={onYearChange} />
      </div>
    </header>
  );
};

export default Navbar;
