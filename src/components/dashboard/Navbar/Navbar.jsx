import { SearchInput } from "@salt-ds/lab";
import styles from "./Navbar.module.scss";

const inputPropsForSearch = {
  placeholder: "Search Drivers....",
  style: {
    paddingLeft: "10px",
  },
};

const Navbar = () => {
  const handleSearch = (e) => {
    console.log(e);
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>F1 Dashboard</div>

      <div className={styles.searchWrapper}>
        {/* SearchInput from Salt Design System - no logic wired yet */}
        <SearchInput
          inputProps={inputPropsForSearch}
          aria-label="Search"
          onChange={handleSearch}
          onSubmit={() => {}}
          className={styles.searchInput}
        />
      </div>
    </header>
  );
};

export default Navbar;
