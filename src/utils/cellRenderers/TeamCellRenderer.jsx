import TEAM_LOGO_MAP from "../../constants/teamLogos.js";
import styles from "./TeamCellRenderer.module.scss";

const TeamCellRenderer = ({ value, data }) => {
  const logoUrl = TEAM_LOGO_MAP[data?.team_name];
  return (
    <span className={styles.teamCell}>
      {value}
      {logoUrl && <img src={logoUrl} alt="" className={styles.teamLogo} />}
    </span>
  );
};

export default TeamCellRenderer;
