const day = (d) => d.getDate();
const month = (d) => d.toLocaleDateString("en-GB", { month: "short" });
const year = (d) => d.getFullYear();

const formatWeekend = (dateStart, dateEnd) => {
  if (!dateStart) return "";
  const start = new Date(dateStart);
  const end = dateEnd ? new Date(dateEnd) : null;
  if (!end) return `${day(start)} ${month(start)} ${year(start)}`;
  if (year(start) === year(end) && month(start) === month(end)) {
    return `${day(start)}–${day(end)} ${month(start)} ${year(start)}`;
  }
  if (year(start) === year(end)) {
    return `${day(start)} ${month(start)} – ${day(end)} ${month(end)} ${year(start)}`;
  }
  return `${day(start)} ${month(start)} ${year(start)} – ${day(end)} ${month(end)} ${year(end)}`;
};

const formatRaceDate = (dateStart) => {
  if (!dateStart) return "";
  return new Date(dateStart).toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export { formatWeekend, formatRaceDate };
