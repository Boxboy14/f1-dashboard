import { useState } from "react";
import DataGrid from "../../DataGrid.jsx";
import DriverInfoCard from "./DriverInfoCard.jsx";
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
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(undefined);
  const [dialogId, setDialogId] = useState("");

  const onGridReady = ({ api }) => api.sizeColumnsToFit();

  const onRowDoubleClicked = ({ data, node: { id } }) => {
    setIsInfoDialogOpen(true);
    setSelectedDriver(data);
    setDialogId(id);
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
      <DriverInfoCard
        driverData={selectedDriver}
        id={dialogId}
        isOpen={isInfoDialogOpen}
        setIsInfoDialogOpen={setIsInfoDialogOpen}
      />
    </div>
  );
};

export default DriversGrid;
