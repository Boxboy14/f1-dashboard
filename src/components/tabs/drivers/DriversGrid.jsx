import DataGrid from "../../DataGrid.jsx";
import { useDriversByYear } from "../../../hooks/useOpenF1.js";
import styles from "./DriversGrid.module.scss";

const columnDefs = [
  { headerName: "Driver Name", field: "full_name", sortable: true },
  { headerName: "Driver Number", field: "driver_number", sortable: true },
  { headerName: "Constructor", field: "team_name", sortable: true },
];

const DriversGrid = ({ year, onDriverOpen = () => {} }) => {
  const { data: drivers = [], isLoading } = useDriversByYear(year);

  const onGridReady = ({ api }) => api.sizeColumnsToFit();
  const onRowDoubleClicked = ({ data }) => onDriverOpen(data);
  const getRowId = ({ data: { first_name, driver_number } }) =>
    `${first_name}-${driver_number}`;

  return (
    <div className={styles.grid}>
      <DataGrid
        columnDefs={columnDefs}
        getRowId={getRowId}
        rowData={isLoading ? [] : drivers}
        onGridReady={onGridReady}
        onRowDoubleClicked={onRowDoubleClicked}
      />
    </div>
  );
};

export default DriversGrid;
