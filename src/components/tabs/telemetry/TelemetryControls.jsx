import {
  Dropdown,
  FormField,
  FormFieldLabel,
  GridLayout,
  Option,
} from "@salt-ds/core";
import styles from "./TelemetryControls.module.scss";

const labelFor = (options) => (value) =>
  options.find((o) => String(o.value) === String(value))?.label ?? String(value);

const TelemetryControls = ({
  events,
  sessions,
  drivers,
  laps,
  meetingKey,
  sessionKey,
  driverNumbers,
  lapSelected,
  onEventChange,
  onSessionChange,
  onDriversChange,
  onLapChange,
}) => {
  const eventLabel = labelFor(events);
  const sessionLabel = labelFor(sessions);
  const driverLabel = labelFor(drivers);
  const lapLabel = labelFor(laps);

  return (
    <GridLayout columns={{ xs: 1, sm: 2 }} gap={2} className={styles.controls}>
      <FormField>
        <FormFieldLabel>Select Event</FormFieldLabel>
        <Dropdown
          className={styles.dropdown}
          placeholder="Select Event"
          disabled={!events.length}
          selected={meetingKey != null ? [String(meetingKey)] : []}
          value={meetingKey != null ? eventLabel(meetingKey) : undefined}
          valueToString={eventLabel}
          onSelectionChange={(_, sel) =>
            onEventChange(sel[0] != null ? Number(sel[0]) : null)
          }
        >
          {events.map((o) => (
            <Option key={o.value} value={String(o.value)}>
              {o.label}
            </Option>
          ))}
        </Dropdown>
      </FormField>

      <FormField>
        <FormFieldLabel>Select Session</FormFieldLabel>
        <Dropdown
          className={styles.dropdown}
          placeholder="Select Session"
          disabled={!sessions.length}
          selected={sessionKey != null ? [String(sessionKey)] : []}
          value={sessionKey != null ? sessionLabel(sessionKey) : undefined}
          valueToString={sessionLabel}
          onSelectionChange={(_, sel) =>
            onSessionChange(sel[0] != null ? Number(sel[0]) : null)
          }
        >
          {sessions.map((o) => (
            <Option key={o.value} value={String(o.value)}>
              {o.label}
            </Option>
          ))}
        </Dropdown>
      </FormField>

      <FormField>
        <FormFieldLabel>Select Drivers (max 2)</FormFieldLabel>
        <Dropdown
          className={styles.dropdown}
          multiselect
          placeholder="Select Drivers"
          disabled={!drivers.length}
          selected={driverNumbers.map(String)}
          value={
            driverNumbers.length
              ? driverNumbers.map((n) => driverLabel(n)).join(", ")
              : undefined
          }
          valueToString={driverLabel}
          onSelectionChange={(_, sel) => {
            if (sel.length <= 2) onDriversChange(sel.map(Number));
          }}
        >
          {drivers.map((o) => (
            <Option key={o.value} value={String(o.value)}>
              {o.label}
            </Option>
          ))}
        </Dropdown>
      </FormField>

      <FormField>
        <FormFieldLabel>Select Lap</FormFieldLabel>
        <Dropdown
          className={styles.dropdown}
          placeholder="Select Lap"
          disabled={!laps.length}
          selected={lapSelected ? [lapSelected] : []}
          value={lapSelected ? lapLabel(lapSelected) : undefined}
          valueToString={lapLabel}
          onSelectionChange={(_, sel) => {
            if (sel[0] != null) onLapChange(sel[0]);
          }}
        >
          {laps.map((o) => (
            <Option key={o.value} value={String(o.value)}>
              {o.label}
            </Option>
          ))}
        </Dropdown>
      </FormField>
    </GridLayout>
  );
};

export default TelemetryControls;
