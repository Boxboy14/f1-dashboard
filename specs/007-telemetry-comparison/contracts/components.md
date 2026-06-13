# Contracts: Telemetry Comparison

Props/return shapes and responsibilities each unit must honor.

---

## API layer: `src/services/api/openf1.js`

**Refactor**: extract `fetchOpenF1Url(url)` (does the rate-limited `schedule(() => fetch(url))` + ok-check + `.json()`); `fetchOpenF1(endpoint, params)` becomes `fetchOpenF1Url(buildUrl(endpoint, params))`.

**Add**: `carDataLap({ session_key, driver_number, date_gte, date_lt })`
- Builds `${BASE_URL}/car_data?session_key=${k}&driver_number=${n}&date>=${E}&date<${L}` with operators encoded (`%3E`, `%3C`) and `E`/`L` = `encodeURIComponent(date)`.
- Returns `fetchOpenF1Url(url)`.
- **Must not** be reachable via the param-based `buildUrl` (operators can't round-trip there).

---

## Hook: `useCarDataLap({ session_key, driver_number, date_gte, date_lt }, options)`

**Location**: `src/hooks/useOpenF1.js`
**Returns**: TanStack Query result (`{ data, isLoading, … }`)
**Contract**: `queryKey: ["car_data_lap", params]`; `queryFn: () => openF1Api.carDataLap(params)`; `staleTime` long (historical, immutable); `enabled: Boolean(session_key && driver_number && date_gte && date_lt)` merged with `options`.

---

## Hook: `useTelemetryComparison(sessionKey, driverNumbers)`

**Location**: `src/hooks/useOpenF1.js`
**Input**: `sessionKey: number|null`, `driverNumbers: number[]` (≤2)
**Returns**: `{ chartData: ChartRow[], drivers: DriverMeta[], isLoading: boolean, statusBySlot: ("ok"|"no-lap"|"no-telemetry"|"empty")[] }`

**Responsibilities**:
- Two fixed slots (A=`driverNumbers[0]`, B=`driverNumbers[1]`). Per slot: `useLaps({session_key, driver_number})` (enabled when both present) → fastest valid lap; `useCarDataLap({...lap window})` (enabled when lap known).
- `useMemo`: `deriveDistance` → `resampleToGrid` → `mergeDrivers`; build `DriverMeta` (name from a `useDrivers({session_key})` lookup, color by slot, lapTime, topSpeed).
- `statusBySlot[i]` = `empty` (no driver), `no-lap` (no valid lap), `no-telemetry` (lap but empty car_data), else `ok`.

**Must not**: call `useCarData` (whole-session); fetch when slots are empty.

---

## Component: `TelemetryPage`

**Location**: `src/components/dashboard/TelemetryPage.jsx`
**Props**: none (reads `{ year }` from `useOutletContext()`).
**State**: `meetingKey`, `sessionKey`, `driverNumbers` with the cascade resets.
**Renders**:
- `<Text styleAs="h2">Telemetry</Text>`
- `<TelemetryControls …>` (events/sessions/drivers options + selected + change handlers)
- when ≥1 driver resolved: `<DriverSummary drivers={drivers} />` then `<TelemetryCharts chartData drivers />`
- states: incomplete selection → prompt `Text`; loading → `CircularProgress`; per-driver `no-lap`/`no-telemetry` → inline message via `statusBySlot`.

---

## Component: `TelemetryControls`

**Location**: `src/components/tabs/telemetry/TelemetryControls.jsx`
**Props**: `{ events, sessions, drivers, meetingKey, sessionKey, driverNumbers, onEventChange, onSessionChange, onDriversChange }`
**Renders**: three Salt `Dropdown`s in `FormField`+`FormFieldLabel`, laid out with `FlexLayout`:
- **Event** — options = events; disabled if no events.
- **Session** — options = sessions; disabled until `meetingKey`.
- **Drivers** — `multiselect`, options = drivers, controlled `selected`; disabled until `sessionKey`; `onSelectionChange` **caps at 2** (drop the change if it would exceed two).

---

## Component: `DriverSummary`

**Location**: `src/components/tabs/telemetry/DriverSummary.jsx`
**Props**: `{ drivers: DriverMeta[] }`
**Renders**: a `FlexLayout` of one Salt `Card`/chip per driver — name in `driver.color`, fastest lap time (`formatLapTime`), top speed. Pure presentational.

---

## Component: `TelemetryCharts`

**Location**: `src/components/tabs/telemetry/TelemetryCharts.jsx`
**Props**: `{ chartData: ChartRow[], drivers: DriverMeta[] }`
**Renders**: a shared legend (driver chips) + a vertical `StackLayout` of `TelemetryChart`, one per entry in `CHANNELS`.

---

## Component: `TelemetryChart`

**Location**: `src/components/tabs/telemetry/TelemetryChart.jsx`
**Props**: `{ channel: ChannelConfig, data: ChartRow[], drivers: DriverMeta[] }`
**Renders**: `ResponsiveContainer` (fixed height ~170px) > `LineChart data={data} syncId="telemetry"`:
- `XAxis dataKey="distance"` (m), channel `YAxis` (domain from config), subtle `CartesianGrid`, `Tooltip`.
- One `<Line>` per driver present: `dataKey={`${channel.key}_${slot}`}` (`gear`→`gear_a`), `stroke={driver.color}`, `dot={false}`, `isAnimationActive={false}`, `type` = `stepAfter` for brake/gear/drs else `monotone`.
- Title `Text` (label + unit).

---

## Config: `src/components/tabs/telemetry/channels.js`

Exports `CHANNELS` (array per data-model) and `DRIVER_COLORS = ["#3FC1C9", "#FB8C00"]`.

---

## Util: `src/utils/telemetry.js`

Exports `deriveDistance`, `resampleToGrid`, `mergeDrivers`, `decodeDrs`, `formatLapTime` (signatures per data-model). Pure, no React.

---

## Routing / nav

- `src/App.jsx`: import `TelemetryPage`; add `<Route path="telemetry" element={<TelemetryPage />} />` inside the `DashboardLayout` route.
- `src/components/dashboard/Sidebar/Sidebar.jsx`: remove `disabled: true` from the `Telemetry` nav item.
