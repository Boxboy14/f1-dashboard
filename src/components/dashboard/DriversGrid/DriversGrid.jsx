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

const DriversGrid = () => {
  const drivers = useSelector(driverSelector);

  const onGridReady = (params) => {
    // console.log(params);

    params.api.sizeColumnsToFit();
  };

  return (
    <div style={{ marginTop: "50px" }}>
      <DataGrid
        columnDefs={columnDefs}
        rowData={drivers}
        onGridReady={onGridReady}
      />
    </div>
  );
};

export default DriversGrid;
