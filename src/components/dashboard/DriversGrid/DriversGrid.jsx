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

  return <DataGrid columnDefs={columnDefs} rowData={drivers} />;
};

export default DriversGrid;
