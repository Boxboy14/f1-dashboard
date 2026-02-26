import styles from "./Navbar.module.scss";
import DriverSearchBar from "./DriverSearch.jsx";

const Navbar = ({ onDriverSelect }) => {
  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>F1 Dashboard</div>
      {/* SearchInput from Salt Design System - no logic wired yet */}
      <div className={styles.searchWrapper}>
        <DriverSearchBar onDriverSelect={onDriverSelect} />
      </div>
    </header>
  );
};

export default Navbar;
