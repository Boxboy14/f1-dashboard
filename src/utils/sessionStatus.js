const deriveSessionStatus = (session, isCancelled) => {
  if (isCancelled) return "Cancelled";
  const start = session.date_start ? new Date(session.date_start) : null;
  const end = session.date_end ? new Date(session.date_end) : null;
  const now = new Date();
  if (start && end) {
    if (end < now) return "Completed";
    if (start <= now) return "In Progress";
    return "Upcoming";
  }
  if (start) return start < now ? "Completed" : "Upcoming";
  return "Unknown";
};

const deriveMeetingStatus = (sessions, isCancelled) => {
  if (isCancelled) return "Cancelled";
  if (!sessions.length) return "Unknown";
  const statuses = sessions.map((s) => s.status);
  if (statuses.includes("In Progress")) return "In Progress";
  if (statuses.every((s) => s === "Completed")) return "Completed";
  if (statuses.every((s) => s === "Upcoming")) return "Upcoming";
  if (statuses.includes("Completed") && statuses.includes("Upcoming")) {
    return "In Progress";
  }
  return "Unknown";
};

export { deriveSessionStatus, deriveMeetingStatus };
