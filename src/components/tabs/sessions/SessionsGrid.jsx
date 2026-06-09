import DataGrid from "../../DataGrid.jsx";
import StatusCellRenderer from "../../../utils/cellRenderers/StatusCellRenderer.jsx";
import { formatDateTime } from "./utils/formatters.js";
import styles from "./SessionsGrid.module.scss";

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
