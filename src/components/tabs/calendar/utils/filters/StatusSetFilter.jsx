import { useCallback } from "react";
import { useGridFilter } from "ag-grid-react";
import { STATUS_STYLES } from "../../../../../utils/cellRenderers/statusStyles.js";
import styles from "../../CalendarGrid.module.scss";

const STATUS_OPTIONS = ["Completed", "Upcoming", "Cancelled"];

const StatusSetFilter = ({ model, onModelChange }) => {
  const doesFilterPass = useCallback(
    ({ data }) => {
      if (!model || model.length === 0) return true;
      return model.includes(data.status);
    },
    [model],
  );

  useGridFilter({ doesFilterPass });

  const toggle = (value) => {
    const current = model ?? [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onModelChange(updated.length ? updated : null);
  };

  return (
    <div className={styles.statusFilter}>
      {STATUS_OPTIONS.map((status) => (
        <label key={status} className={styles.statusFilterOption}>
          <input
            type="checkbox"
            checked={model?.includes(status) ?? false}
            onChange={() => toggle(status)}
          />
          <span style={STATUS_STYLES[status]}>{status}</span>
        </label>
      ))}
    </div>
  );
};

export default StatusSetFilter;
