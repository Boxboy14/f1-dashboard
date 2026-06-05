import { useCallback } from "react";
import { useGridFilter } from "ag-grid-react";
import DataGrid from "../../DataGrid.jsx";
import { useRaceCalendar } from "../../../hooks/useOpenF1.js";
import styles from "./CalendarGrid.module.scss";

const formatDate = ({ value }) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const CountryCellRenderer = ({ value, data }) => (
  <span className={styles.countryCell}>
    {data?.country_flag && (
      <img src={data.country_flag} alt="" className={styles.countryFlag} />
    )}
    {value}
  </span>
);

const STATUS_STYLES = {
  Completed: { color: "var(--salt-content-secondary-foreground)" },
  Upcoming: { color: "#22c55e" },
  Cancelled: { color: "var(--salt-status-error-foreground)" },
};

const StatusCellRenderer = ({ value }) => (
  <span style={STATUS_STYLES[value] ?? {}}>{value}</span>
);

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

const columnDefs = [
  { headerName: "Round", field: "round", sortable: true, width: 70 },
  { headerName: "Grand Prix", field: "meeting_name", sortable: true, flex: 1 },
  {
    headerName: "Circuit",
    field: "circuit_short_name",
    sortable: true,
    flex: 1,
  },
  {
    headerName: "Country",
    field: "country_name",
    sortable: true,
    width: 160,
    cellRenderer: CountryCellRenderer,
  },
  {
    headerName: "Date",
    field: "date_start",
    sortable: true,
    width: 130,
    valueFormatter: formatDate,
    filter: "agTextColumnFilter",
    filterValueGetter: ({ data }) => formatDate({ value: data?.date_start }),
  },
  {
    headerName: "Status",
    field: "status",
    sortable: true,
    width: 120,
    cellRenderer: StatusCellRenderer,
    filter: StatusSetFilter,
  },
];

const CalendarGrid = ({ year, onRaceOpen = () => {} }) => {
  const { data: races = [], isLoading } = useRaceCalendar(year);

  const onGridReady = ({ api }) => api.sizeColumnsToFit();
  const onRowDoubleClicked = ({ data }) => onRaceOpen(data);
  const getRowId = ({ data: { meeting_key } }) => String(meeting_key);

  return (
    <div className={styles.grid}>
      <DataGrid
        columnDefs={columnDefs}
        getRowId={getRowId}
        rowData={isLoading ? [] : races}
        onGridReady={onGridReady}
        onRowDoubleClicked={onRowDoubleClicked}
      />
    </div>
  );
};

export default CalendarGrid;
