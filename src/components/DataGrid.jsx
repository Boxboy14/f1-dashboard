import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

const defaultColDefs = {
  sortable: true,
  filter: true,
  floatingFilter: true,
  resizable: true,
};

const gridTheme = themeQuartz.withParams({
  backgroundColor: "#0f0f0f",
  foregroundColor: "#e5e7eb",
  headerBackgroundColor: "#1a1a1a",
  headerForegroundColor: "#ffffff",
  rowHoverColor: "#1f1f1f",
  selectedRowBackgroundColor: "#262626",
  borderColor: "#2a2a2a",
  browserColorScheme: "dark",
});

const DataGrid = ({ rowData, columnDefs, onGridReady, ...rest }) => {
  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDefs}
        onGridReady={onGridReady}
        theme={gridTheme}
        {...rest}
      />
    </div>
  );
};

export default DataGrid;
