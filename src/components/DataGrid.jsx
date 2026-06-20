import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

const defaultColDefs = {
  sortable: true,
  filter: true,
  floatingFilter: true,
  resizable: true,
};

// ag-grid applies these params as CSS custom properties, so var(--salt-…) refs
// resolve and re-theme automatically when SaltProvider flips mode.
const gridTheme = themeQuartz.withParams({
  backgroundColor: "var(--salt-container-primary-background)",
  foregroundColor: "var(--salt-content-primary-foreground)",
  headerBackgroundColor: "var(--salt-container-secondary-background)",
  headerForegroundColor: "var(--salt-content-primary-foreground)",
  rowHoverColor: "var(--salt-container-tertiary-background)",
  selectedRowBackgroundColor: "var(--salt-container-tertiary-background)",
  borderColor: "var(--salt-separable-secondary-borderColor)",
  browserColorScheme: "inherit",
});

const DataGrid = ({ rowData, columnDefs, onGridReady, height = "80vh", ...rest }) => {
  return (
    <div style={{ height, width: "100%" }}>
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
