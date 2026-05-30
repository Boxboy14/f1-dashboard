import DataGrid from "../../DataGrid.jsx";
import { useTeamsByYear } from "../../../hooks/useOpenF1.js";
import TEAM_LOGO_MAP from "../../../constants/teamLogos.js";
import styles from "./TeamsGrid.module.scss";

const TeamCellRenderer = ({ value, data }) => {
  const logoUrl = TEAM_LOGO_MAP[data?.team_name];
  return (
    <span className={styles.teamCell}>
      {logoUrl && <img src={logoUrl} alt="" className={styles.teamLogo} />}
      {value}
    </span>
  );
};

const columnDefs = [
  { headerName: "Rank", field: "position_current", sortable: true, width: 80 },
  { headerName: "Team", field: "team_name", sortable: true, flex: 1, cellRenderer: TeamCellRenderer },
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
