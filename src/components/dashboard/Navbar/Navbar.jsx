import { SearchInput } from "@salt-ds/lab";
import styles from "./Navbar.module.scss";

const Navbar = () => {
  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>F1 Dashboard</div>

      <div className={styles.searchWrapper}>
        {/* SearchInput from Salt Design System - no logic wired yet */}
        <SearchInput
          placeholder="Search Drivers"
          aria-label="Search"
          onChange={() => {}}
          onSubmit={() => {}}
          className={styles.searchInput}
        />
      </div>
    </header>
  );
};

export default Navbar;
