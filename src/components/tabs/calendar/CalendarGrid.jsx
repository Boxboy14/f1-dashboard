import DataGrid from "../../DataGrid.jsx";
import { useRaceCalendar } from "../../../hooks/useOpenF1.js";
import StatusCellRenderer from "../../../utils/cellRenderers/StatusCellRenderer.jsx";
import CountryCellRenderer from "./utils/cellRenderers/CountryCellRenderer.jsx";
import StatusSetFilter from "./utils/filters/StatusSetFilter.jsx";
import { formatDate } from "./utils/formatters.js";
import styles from "./CalendarGrid.module.scss";

const columnDefs = [
  { headerName: "Round", field: "round", sortable: true, width: 70 },
  { headerName: "Grand Prix", field: "meeting_name", sortable: true, flex: 1 },
  {
    headerName: "Circuit",
    field: "circuit_short_name",
    sortable: true,
    flex: 1,
  },
  {
    headerName: "Country",
    field: "country_name",
    sortable: true,
    width: 160,
    cellRenderer: CountryCellRenderer,
  },
  {
    headerName: "Date",
    field: "date_start",
    sortable: true,
    width: 130,
    valueFormatter: formatDate,
    filter: "agTextColumnFilter",
    filterValueGetter: ({ data }) => formatDate({ value: data?.date_start }),
  },
  {
    headerName: "Status",
    field: "status",
    sortable: true,
    width: 120,
    cellRenderer: StatusCellRenderer,
    filter: StatusSetFilter,
  },
];

const CalendarGrid = ({ year, onRaceOpen = () => {} }) => {
  const { data: races = [], isLoading } = useRaceCalendar(year);

  const onGridReady = ({ api }) => api.sizeColumnsToFit();
  const onRowDoubleClicked = ({ data }) => onRaceOpen(data);
  const getRowId = ({ data: { meeting_key } }) => String(meeting_key);

  return (
    <div className={styles.grid}>
      <DataGrid
        columnDefs={columnDefs}
        getRowId={getRowId}
        rowData={isLoading ? [] : races}
        onGridReady={onGridReady}
        onRowDoubleClicked={onRowDoubleClicked}
      />
    </div>
  );
};

export default CalendarGrid;
