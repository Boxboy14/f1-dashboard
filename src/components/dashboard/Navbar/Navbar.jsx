import { MenuIcon } from "@salt-ds/icons";
import styles from "./Navbar.module.scss";
import DriverSearchBar from "./DriverSearch.jsx";

const Navbar = ({ onDriverSelect, onMenuClick }) => {
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
      <div className={styles.searchWrapper}>
        <DriverSearchBar onDriverSelect={onDriverSelect} />
      </div>
    </header>
  );
};

export default Navbar;
