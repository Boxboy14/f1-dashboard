import DataGrid from "../../DataGrid.jsx";
import { driverSelector } from "../../../store/drivers/selector.js";
import { useSelector } from "react-redux";

const columnDefs = [
  {
    headerName: "Driver Name",
    field: "full_name",
    sortable: true,
  },
  {
    headerName: "Driver Number",
    field: "driver_number",
    sortable: true,
  },
  {
    headerName: "Nationality",
    field: "country_code",
    sortable: true,
  },
  {
    headerName: "Constructor",
    field: "team_name",
    sortable: true,
  },
];

const DriversGrid = ({ onDriverOpen = () => {} }) => {
  const drivers = useSelector(driverSelector);

  const onGridReady = ({ api }) => api.sizeColumnsToFit();

  const onRowDoubleClicked = ({ data }) => {
    onDriverOpen(data);
  };

  const getRowId = ({ data: { first_name, driver_number } }) =>
    `${first_name}-${driver_number}`;

  return (
    <div style={{ marginTop: "50px" }}>
      <DataGrid
        columnDefs={columnDefs}
        getRowId={getRowId}
        rowData={drivers}
        onGridReady={onGridReady}
        onRowDoubleClicked={onRowDoubleClicked}
      />
    </div>
  );
};

export default DriversGrid;
