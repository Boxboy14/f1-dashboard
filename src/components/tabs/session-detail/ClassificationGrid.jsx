import DataGrid from "../../DataGrid.jsx";
import StatusCellRenderer from "../../../utils/cellRenderers/StatusCellRenderer.jsx";
import TeamCellRenderer from "../../../utils/cellRenderers/TeamCellRenderer.jsx";
import { formatLapTime, formatGap } from "./utils/formatters.js";
import styles from "./ClassificationGrid.module.scss";

const RACE_COLUMN_DEFS = [
  { headerName: "#", field: "position", width: 60, sortable: true },
  { headerName: "Driver", field: "full_name", flex: 1, sortable: true },
  {
    headerName: "Team",
    field: "team_name",
    width: 180,
    sortable: true,
    cellRenderer: TeamCellRenderer,
  },
  {
    headerName: "Gap to Leader",
    field: "gap_to_leader",
    width: 130,
    sortable: false,
    valueFormatter: formatGap,
  },
  {
    headerName: "Status",
    field: "status",
    width: 100,
    sortable: true,
    cellRenderer: StatusCellRenderer,
  },
];

const TIME_COLUMN_DEFS = [
  { headerName: "#", field: "position", width: 60, sortable: true },
  { headerName: "Driver", field: "full_name", flex: 1, sortable: true },
  {
    headerName: "Team",
    field: "team_name",
    width: 180,
    sortable: true,
    cellRenderer: TeamCellRenderer,
  },
  {
    headerName: "Best Time",
    field: "best_time",
    width: 150,
    sortable: true,
    valueFormatter: formatLapTime,
  },
];

const ClassificationGrid = ({ results, sessionType, isLoading }) => {
  const columnDefs = ["Race", "Sprint"].includes(sessionType)
    ? RACE_COLUMN_DEFS
    : TIME_COLUMN_DEFS;

  const onGridReady = ({ api }) => api.sizeColumnsToFit();
  const getRowId = ({ data }) => String(data.driver_number);

  return (
    <div className={styles.grid}>
      <DataGrid
        columnDefs={columnDefs}
        getRowId={getRowId}
        rowData={isLoading ? [] : results}
        onGridReady={onGridReady}
      />
    </div>
  );
};

export default ClassificationGrid;
