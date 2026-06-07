import styles from "../../CalendarGrid.module.scss";

const CountryCellRenderer = ({ value, data }) => (
  <span className={styles.countryCell}>
    {data?.country_flag && (
      <img src={data.country_flag} alt="" className={styles.countryFlag} />
    )}
    {value}
  </span>
);

export default CountryCellRenderer;
