import DataGrid from "../../DataGrid.jsx";
import styles from "./SessionsGrid.module.scss";

const formatDateTime = ({ value }) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const STATUS_STYLES = {
  Completed: { color: "var(--salt-content-secondary-foreground)" },
  "In Progress": { color: "var(--salt-status-warning-foreground)" },
  Upcoming: { color: "#22c55e" },
  Cancelled: { color: "var(--salt-status-error-foreground)" },
  Unknown: { color: "var(--salt-content-secondary-foreground)" },
};

const StatusCellRenderer = ({ value }) => (
  <span style={STATUS_STYLES[value] ?? {}}>{value}</span>
);

const columnDefs = [
  { headerName: "Session", field: "session_name", sortable: true, flex: 1 },
  { headerName: "Type", field: "session_type", sortable: true, width: 120 },
  {
    headerName: "Date",
    field: "date_start",
    sortable: true,
    width: 180,
    valueFormatter: formatDateTime,
    filter: "agTextColumnFilter",
    filterValueGetter: ({ data }) =>
      formatDateTime({ value: data?.date_start }),
  },
  {
    headerName: "Status",
    field: "status",
    sortable: true,
    width: 130,
    cellRenderer: StatusCellRenderer,
  },
];

const SessionsGrid = ({ sessions, isLoading, onSessionOpen }) => {
  const onGridReady = ({ api }) => api.sizeColumnsToFit();
  const onRowDoubleClicked = ({ data }) => onSessionOpen(data);
  const getRowId = ({ data }) => String(data.session_key);

  return (
    <div className={styles.grid}>
      <DataGrid
        columnDefs={columnDefs}
        getRowId={getRowId}
        rowData={isLoading ? [] : sessions}
        onGridReady={onGridReady}
        onRowDoubleClicked={onRowDoubleClicked}
      />
    </div>
  );
};

export default SessionsGrid;
