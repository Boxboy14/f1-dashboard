import { CHANNELS } from "../../components/tabs/telemetry/channels.js";
import { titleCaseCompound } from "./tyres.js";

const round = (n) => Math.round(n);
const colValues = (chartData, key, suffix) =>
  chartData.map((r) => r[`${key}_${suffix}`]).filter((v) => v != null);
const maxOf = (a) => (a.length ? Math.max(...a) : null);
const minOf = (a) => (a.length ? Math.min(...a) : null);
const avgOf = (a) =>
  a.length ? a.reduce((s, v) => s + v, 0) / a.length : null;
const shareOn = (a, pred) =>
  a.length ? (a.filter(pred).length / a.length) * 100 : 0;

function summarizeChannel(channel, okDrivers, chartData) {
  const per = okDrivers.map((d) => {
    const v = colValues(chartData, channel.key, d.suffix);
    switch (channel.key) {
      case "speed":
        return { d, headline: `${round(maxOf(v))} km/h`, n: maxOf(v) };
      case "throttle":
        return { d, headline: `${round(avgOf(v))}% avg`, n: avgOf(v) };
      case "brake":
        return {
          d,
          headline: `${round(shareOn(v, (x) => x > 0))}% of lap`,
          n: shareOn(v, (x) => x > 0),
        };
      case "gear":
        return { d, headline: `gears ${minOf(v)}–${maxOf(v)}`, n: maxOf(v) };
      case "rpm":
        return { d, headline: `${round(maxOf(v))} rpm`, n: maxOf(v) };
      case "drs":
        return {
          d,
          headline: `${round(shareOn(v, (x) => x === 1))}% of lap`,
          n: shareOn(v, (x) => x === 1),
        };
      default:
        return { d, headline: "—", n: null };
    }
  });

  const bullet = per.map((p) => `${p.d.name}: ${p.headline}`).join(" · ");
  const paragraph = channelParagraph(channel, per);
  return { label: channel.label, unit: channel.unit, bullet, paragraph };
}

const INTRO = {
  speed:
    "Top speed reached on the lap — the highest point on the speed trace, typically at the end of the longest straight.",
  throttle:
    "Average throttle application across the lap; a higher figure means more time at or near full power.",
  brake:
    "Share of the lap spent on the brakes — a rough measure of how braking-heavy the circuit and driving style are.",
  gear: "The span of gears the driver used around the lap.",
  rpm: "Peak engine revs reached on the lap.",
  drs: "Share of the lap with DRS open — the drag-reduction flap, usable only in designated zones — which lifts top speed where it is deployed.",
};

function channelParagraph(channel, per) {
  const intro = INTRO[channel.key] ?? "";
  if (per.length === 2) {
    const [a, b] = per;
    let cmp = `${a.d.name} recorded ${a.headline} and ${b.d.name} ${b.headline}.`;
    if (a.n != null && b.n != null && a.n !== b.n) {
      const lead = a.n > b.n ? a.d.name : b.d.name;
      cmp += ` ${lead} came out ahead on this measure.`;
    }
    return `${intro} ${cmp}`;
  }
  const only = per[0];
  return `${intro} ${only.d.name} recorded ${only.headline}.`;
}

export function buildLapSummary({
  gpName,
  circuitName,
  sessionName,
  lapLabel,
  drivers,
  chartData,
  year,
}) {
  const reportDrivers = drivers.map((d) => ({
    name: d.name,
    driver_number: d.driver_number,
    lapNumber: d.lap_number,
    compound: titleCaseCompound(d.compound) ?? null,
    compoundRaw: d.compound ?? null,
    tyreAge: d.tyreAge ?? null,
    sectors: d.sectors ?? null,
    hasData: d.status === "ok",
  }));

  const okDrivers = drivers.filter((d) => d.status === "ok");
  const channels = chartData.length
    ? CHANNELS.map((c) => summarizeChannel(c, okDrivers, chartData))
    : [];

  return {
    gpName,
    circuitName,
    sessionName,
    lapLabel,
    drivers: reportDrivers,
    channels,
    year,
  };
}
