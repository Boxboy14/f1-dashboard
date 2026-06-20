import DataGrid from "../../DataGrid.jsx";
import { useTeamsByYear } from "../../../hooks/useOpenF1.js";
import TeamCellRenderer from "../../../utils/cellRenderers/TeamCellRenderer.jsx";
import styles from "./TeamsGrid.module.scss";

const columnDefs = [
  { headerName: "Rank", field: "position_current", sortable: true, width: 80 },
  {
    headerName: "Team",
    field: "team_name",
    sortable: true,
    flex: 1,
    cellRenderer: TeamCellRenderer,
  },
  { headerName: "Points", field: "points_current", sortable: true, width: 100 },
];

const TeamsGrid = ({ year, onTeamOpen = () => {} }) => {
  const { data: teams = [], isLoading } = useTeamsByYear(year);

  const onGridReady = ({ api }) => api.sizeColumnsToFit();
  const onRowDoubleClicked = ({ data }) => onTeamOpen(data);
  const getRowId = ({ data: { team_name } }) => team_name;
  const getRowStyle = ({ data }) =>
    data?.team_colour ? { borderLeft: `6px solid #${data.team_colour}` } : {};

  return (
    <div className={styles.grid}>
      <DataGrid
        columnDefs={columnDefs}
        getRowId={getRowId}
        getRowStyle={getRowStyle}
        rowData={isLoading ? [] : teams}
        onGridReady={onGridReady}
        onRowDoubleClicked={onRowDoubleClicked}
      />
    </div>
  );
};

export default TeamsGrid;
