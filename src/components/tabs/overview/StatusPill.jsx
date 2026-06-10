import { STATUS_STYLES } from "../../../utils/cellRenderers/statusStyles.js";
import styles from "./StatusPill.module.scss";

const StatusPill = ({ status }) => (
  <span className={styles.pill} style={STATUS_STYLES[status] ?? {}}>
    {status}
  </span>
);

export default StatusPill;
