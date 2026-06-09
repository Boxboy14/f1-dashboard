import { STATUS_STYLES } from "./statusStyles.js";

const StatusCellRenderer = ({ value }) => (
  <span style={STATUS_STYLES[value] ?? {}}>{value}</span>
);

export default StatusCellRenderer;
