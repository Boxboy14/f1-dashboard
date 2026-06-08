import { useState, useMemo, useCallback } from "react";
import DataGrid from "../../DataGrid.jsx";
import TeamCellRenderer from "../../../utils/cellRenderers/TeamCellRenderer.jsx";
import styles from "./PitStopsGrid.module.scss";

// ── cell renderers (module-level = stable reference, no re-creation on render) ──

const DriverGroupCellRenderer = ({ data, context }) => {
  if (data.rowType === "child") {
    return <span className={styles.childIndent} />;
  }
  if (data.rowType === "single") {
    return <span>{data.full_name}</span>;
  }
  return (
    <button
      className={styles.expandButton}
      onClick={() => context.toggleExpanded(data.driver_number)}
    >
      <span
        className={`${styles.expandIcon} ${data.isExpanded ? styles.expandIconOpen : ""}`}
      >
        ▶
      </span>
      {data.full_name}
    </button>
  );
};

const TeamColumnRenderer = (params) => {
  if (params.data?.rowType === "child") return null;
  return <TeamCellRenderer {...params} />;
};

// ── column definitions ───────────────────────────────────────────────────────

const columnDefs = [
  {
    headerName: "Driver",
    field: "full_name",
    flex: 1,
    sortable: false,
    cellRenderer: DriverGroupCellRenderer,
  },
  {
    headerName: "Team",
    field: "team_name",
    width: 200,
    sortable: false,
    cellRenderer: TeamColumnRenderer,
  },
  {
    headerName: "Lap",
    field: "lap_number",
    width: 80,
    sortable: false,
    filter: false,
    valueGetter: ({ data }) =>
      data?.rowType === "parent" ? null : data?.lap_number,
  },
  {
    headerName: "Duration",
    field: "pit_duration",
    width: 120,
    sortable: false,
    filter: false,
    valueGetter: ({ data }) =>
      data?.rowType === "parent" ? null : data?.pit_duration,
    valueFormatter: ({ value }) =>
      value == null ? "" : `${value.toFixed(1)}s`,
  },
];

// ── data transformation ──────────────────────────────────────────────────────

function buildViewRows(pitStops, expandedDrivers) {
  const grouped = new Map();
  pitStops.forEach((stop) => {
    if (!grouped.has(stop.driver_number)) {
      grouped.set(stop.driver_number, []);
    }
    grouped.get(stop.driver_number).push(stop);
  });

  const rows = [];
  grouped.forEach((stops, driverNum) => {
    const first = stops[0];
    if (stops.length === 1) {
      rows.push({ ...first, rowType: "single" });
      return;
    }
    const isExpanded = expandedDrivers.has(driverNum);
    rows.push({
      driver_number: first.driver_number,
      full_name: first.full_name,
      team_name: first.team_name,
      rowType: "parent",
      isExpanded,
    });
    if (isExpanded) {
      stops.forEach((stop) => {
        rows.push({ ...stop, rowType: "child" });
      });
    }
  });
  return rows;
}

// ── component ────────────────────────────────────────────────────────────────

const PitStopsGrid = ({ pitStops, isLoading }) => {
  const [expandedDrivers, setExpandedDrivers] = useState(new Set());

  const toggleExpanded = useCallback((driverNum) => {
    setExpandedDrivers((prev) => {
      const next = new Set(prev);
      next.has(driverNum) ? next.delete(driverNum) : next.add(driverNum);
      return next;
    });
  }, []);

  const viewRows = useMemo(
    () => buildViewRows(pitStops, expandedDrivers),
    [pitStops, expandedDrivers],
  );

  const context = useMemo(() => ({ toggleExpanded }), [toggleExpanded]);

  const onGridReady = useCallback(({ api }) => api.sizeColumnsToFit(), []);

  const getRowId = ({ data }) => {
    if (data.rowType === "parent") {
      return `${data.driver_number}-parent`;
    }
    if (data.rowType === "child") {
      return `${data.driver_number}-${data.lap_number}`;
    }
    return String(data.driver_number);
  };

  return (
    <div className={styles.grid}>
      <DataGrid
        columnDefs={columnDefs}
        getRowId={getRowId}
        rowData={isLoading ? [] : viewRows}
        onGridReady={onGridReady}
        context={context}
      />
    </div>
  );
};

export default PitStopsGrid;
