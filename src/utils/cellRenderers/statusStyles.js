const STATUS_STYLES = {
  Completed: { color: "var(--salt-content-secondary-foreground)" },
  "In Progress": { color: "var(--salt-status-warning-foreground)" },
  Upcoming: { color: "var(--salt-color-green-500)" },
  Cancelled: { color: "var(--salt-status-error-foreground)" },
  Unknown: { color: "var(--salt-content-secondary-foreground)" },
  Finished: { color: "var(--salt-content-secondary-foreground)" },
  DNF: { color: "var(--salt-status-error-foreground)" },
  DNS: { color: "var(--salt-status-error-foreground)" },
  DSQ: { color: "var(--salt-status-error-foreground)" },
};

export { STATUS_STYLES };
