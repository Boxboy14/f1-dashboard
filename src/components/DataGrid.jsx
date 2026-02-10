import { AgGridReact } from "ag-grid-react";

const DataGrid = ({ rowData, columnDefs }) => {
  return (
    <div className="ag-theme-quartz" style={{ height: "90vh", width: "100%" }}>
      <AgGridReact rowData={rowData} columnDefs={columnDefs} />
    </div>
  );
};

export default DataGrid;
