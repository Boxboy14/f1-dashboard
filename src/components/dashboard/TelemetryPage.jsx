import { useState, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { CircularProgress, Text } from "@salt-ds/core";
import {
  useRaceCalendar,
  useSessions,
  useDrivers,
  useTelemetryComparison,
} from "../../hooks/useOpenF1.js";
import TelemetryControls from "../tabs/telemetry/TelemetryControls.jsx";
import DriverSummary from "../tabs/telemetry/DriverSummary.jsx";
import TelemetryCharts from "../tabs/telemetry/TelemetryCharts.jsx";
import styles from "./TelemetryPage.module.scss";

// Keyed by year: changing the navbar season remounts the view, which resets
// every selection (dropdowns + charts) to the start — the React-idiomatic reset.
const TelemetryPage = () => {
  const { year } = useOutletContext();
  return <TelemetryView key={year} year={year} />;
};

const TelemetryView = ({ year }) => {
  const [meetingKey, setMeetingKey] = useState(null);
  const [sessionKey, setSessionKey] = useState(null);
  const [driverNumbers, setDriverNumbers] = useState([]);

  const { data: meetings = [] } = useRaceCalendar(year);
  const { data: sessions = [] } = useSessions(
    { meeting_key: meetingKey },
    { enabled: Boolean(meetingKey) }
  );
  const { data: drivers = [] } = useDrivers(
    { session_key: sessionKey },
    { enabled: Boolean(sessionKey) }
  );

  const eventOptions = useMemo(
    () =>
      meetings.map((m) => ({
        value: m.meeting_key,
        label: `R${m.round} · ${m.meeting_name}`,
      })),
    [meetings]
  );
  const sessionOptions = useMemo(
    () =>
      [...sessions]
        .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
        .map((s) => ({ value: s.session_key, label: s.session_name })),
    [sessions]
  );
  const driverOptions = useMemo(
    () => drivers.map((d) => ({ value: d.driver_number, label: d.full_name })),
    [drivers]
  );

  const onEventChange = useCallback((value) => {
    setMeetingKey(value);
    setSessionKey(null);
    setDriverNumbers([]);
  }, []);
  const onSessionChange = useCallback((value) => {
    setSessionKey(value);
    setDriverNumbers([]);
  }, []);
  const onDriversChange = useCallback((value) => setDriverNumbers(value), []);

  const {
    chartData,
    drivers: telemetryDrivers,
    isLoading,
  } = useTelemetryComparison(sessionKey, driverNumbers);

  const ready = Boolean(sessionKey && driverNumbers.length);
  const hasData = chartData.length > 0;

  return (
    <>
      <Text styleAs="h2">Telemetry</Text>
      <TelemetryControls
        events={eventOptions}
        sessions={sessionOptions}
        drivers={driverOptions}
        meetingKey={meetingKey}
        sessionKey={sessionKey}
        driverNumbers={driverNumbers}
        onEventChange={onEventChange}
        onSessionChange={onSessionChange}
        onDriversChange={onDriversChange}
      />

      {!ready ? (
        <Text color="secondary" className={styles.message}>
          Select an event, session and driver to view telemetry.
        </Text>
      ) : isLoading && !hasData ? (
        <CircularProgress aria-label="Loading telemetry" />
      ) : (
        <>
          <DriverSummary drivers={telemetryDrivers} />
          {hasData ? (
            <TelemetryCharts chartData={chartData} drivers={telemetryDrivers} />
          ) : (
            <Text color="secondary" className={styles.message}>
              No telemetry available for this selection.
            </Text>
          )}
        </>
      )}
    </>
  );
};

export default TelemetryPage;
