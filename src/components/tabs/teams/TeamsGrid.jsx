import DataGrid from "../../DataGrid.jsx";
import { useTeamsByYear } from "../../../hooks/useOpenF1.js";
import styles from "./TeamsGrid.module.scss";

const columnDefs = [
  { headerName: "Rank", field: "position_current", sortable: true, width: 80 },
  { headerName: "Team", field: "team_name", sortable: true, flex: 1 },
  { headerName: "Points", field: "points_current", sortable: true, width: 100 },
  {
    headerName: "Driver 1",
    valueGetter: ({ data }) => data.drivers[0]?.full_name ?? "—",
    sortable: false,
    flex: 1,
  },
  {
    headerName: "Driver 2",
    valueGetter: ({ data }) => data.drivers[1]?.full_name ?? "—",
    sortable: false,
    flex: 1,
  },
];

const TeamsGrid = ({ year, onTeamOpen = () => {} }) => {
  const { data: teams = [], isLoading } = useTeamsByYear(year);

  const onGridReady = ({ api }) => api.sizeColumnsToFit();
  const onRowDoubleClicked = ({ data }) => onTeamOpen(data);
  const getRowId = ({ data: { team_name } }) => team_name;

  return (
    <div className={styles.grid}>
      <DataGrid
        columnDefs={columnDefs}
        getRowId={getRowId}
        rowData={isLoading ? [] : teams}
        onGridReady={onGridReady}
        onRowDoubleClicked={onRowDoubleClicked}
      />
    </div>
  );
};

export default TeamsGrid;
