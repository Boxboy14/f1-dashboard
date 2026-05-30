import DataGrid from "../../DataGrid.jsx";
import { useDrivers } from "../../../hooks/useOpenF1.js";

const columnDefs = [
  { headerName: "Driver Name", field: "full_name", sortable: true },
  { headerName: "Driver Number", field: "driver_number", sortable: true },
  //   { headerName: "Nationality", field: "country_name", sortable: true },
  { headerName: "Constructor", field: "team_name", sortable: true },
];

const DriversGrid = ({ onDriverOpen = () => {} }) => {
  const { data: drivers = [], isLoading } = useDrivers({
    session_key: "latest",
  });

  const onGridReady = ({ api }) => api.sizeColumnsToFit();
  const onRowDoubleClicked = ({ data }) => onDriverOpen(data);
  const getRowId = ({ data: { first_name, driver_number } }) =>
    `${first_name}-${driver_number}`;

  return (
    <div style={{ marginTop: "24px" }}>
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
