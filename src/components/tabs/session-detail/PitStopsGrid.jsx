import DataGrid from "../../DataGrid.jsx";
import TeamCellRenderer from "../../../utils/cellRenderers/TeamCellRenderer.jsx";
import { formatPitDuration } from "./utils/formatters.js";
import styles from "./PitStopsGrid.module.scss";

const columnDefs = [
  { headerName: "Driver", field: "full_name", flex: 1, sortable: true },
  { headerName: "Team", field: "team_name", width: 180, sortable: true, cellRenderer: TeamCellRenderer },
  { headerName: "Lap", field: "lap_number", width: 80, sortable: true },
  {
    headerName: "Duration",
    field: "pit_duration",
    width: 120,
    sortable: true,
    valueFormatter: formatPitDuration,
  },
];

const PitStopsGrid = ({ pitStops, isLoading }) => {
  const onGridReady = ({ api }) => api.sizeColumnsToFit();
  const getRowId = ({ data }) => `${data.driver_number}-${data.lap_number}`;

  return (
    <div className={styles.grid}>
      <DataGrid
        columnDefs={columnDefs}
        getRowId={getRowId}
        rowData={isLoading ? [] : pitStops}
        onGridReady={onGridReady}
      />
    </div>
  );
};

export default PitStopsGrid;
