const formatLapTime = ({ value }) => {
  if (value == null) return "—";
  const mins = Math.floor(value / 60);
  const secs = value % 60;
  const secsStr = secs.toFixed(3).padStart(6, "0");
  return mins > 0 ? `${mins}:${secsStr}` : secsStr;
};

const formatGap = ({ value }) => value ?? "";

const formatPitDuration = ({ value }) => {
  if (value == null) return "—";
  return `${value.toFixed(1)}s`;
};

export { formatLapTime, formatGap, formatPitDuration };
