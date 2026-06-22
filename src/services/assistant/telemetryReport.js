import { deriveDistance, resampleToGrid, mergeDrivers } from "../../utils/telemetry.js";
import { compoundForLap, tyreAgeForLap } from "../../utils/telemetry/tyres.js";
import { buildLapSummary } from "../../utils/telemetry/lapSummary.js";
import { downloadLapSummary } from "../../utils/telemetry/lapSummaryPdf.js";
import { writeTelemetrySelection } from "../../utils/telemetry/selectionStorage.js";
import { f1Fetch, matchDriver, resolveSession } from "./f1Resolvers.js";

const TELEMETRY_GRID_POINTS = 400;

function pickLap(laps, lap) {
  const valid = laps.filter((l) => l.lap_duration != null && !l.is_pit_out_lap);
  if (!valid.length) return { error: "no-laps" };
  if (lap == null || lap === "fastest") {
    return { lap: valid.reduce((a, b) => (b.lap_duration < a.lap_duration ? b : a)) };
  }
  const found = valid.find((l) => l.lap_number === Number(lap));
  return found ? { lap: found } : { error: "no-lap" };
}

export async function buildAndDownloadReport({ queryClient, year, grandPrix, session, drivers, lap }) {
  const { meeting, session: sess } = await resolveSession(queryClient, {
    year,
    grandPrix,
    session,
  });
  if (!meeting)
    return { ok: false, problem: `Couldn't find a ${year} Grand Prix matching "${grandPrix}".` };
  if (!sess)
    return { ok: false, problem: `Couldn't find a "${session}" session for the ${year} ${meeting.meeting_name}.` };

  const allDrivers = await f1Fetch.drivers(queryClient, sess.session_key);
  const resolved = [];
  for (const query of drivers) {
    const match = matchDriver(allDrivers, query);
    if (!match)
      return { ok: false, problem: `Couldn't find driver "${query}" in the ${year} ${meeting.meeting_name} ${sess.session_name}.` };
    if (!resolved.some((d) => d.driver_number === match.driver_number)) resolved.push(match);
  }

  const stints = await f1Fetch.stints(queryClient, sess.session_key);

  const slots = [];
  for (const drv of resolved) {
    const laps = await f1Fetch.laps(queryClient, sess.session_key, drv.driver_number);
    const picked = pickLap(laps, lap);
    if (picked.error === "no-laps")
      return { ok: false, problem: `${drv.full_name} has no timed laps in the ${year} ${meeting.meeting_name} ${sess.session_name}.` };
    if (picked.error === "no-lap")
      return { ok: false, problem: `${drv.full_name} has no timed lap ${lap} in that session — try "fastest" or another lap.` };

    const lapObj = picked.lap;
    const dateLt = new Date(
      new Date(lapObj.date_start).getTime() + lapObj.lap_duration * 1000,
    ).toISOString();
    const samples = await f1Fetch.carDataLap(queryClient, {
      session_key: sess.session_key,
      driver_number: drv.driver_number,
      date_gte: lapObj.date_start,
      date_lt: dateLt,
    });
    slots.push({ drv, lapObj, samples });
  }

  const grids = [null, null];
  const reportDrivers = slots.map((slot, i) => {
    const { drv, lapObj, samples } = slot;
    const base = {
      driver_number: drv.driver_number,
      name: drv.full_name ?? `#${drv.driver_number}`,
      slot: i,
      suffix: i === 0 ? "a" : "b",
      lap_number: lapObj.lap_number,
      lapTime: lapObj.lap_duration,
      sectors: {
        s1: lapObj.duration_sector_1 ?? null,
        s2: lapObj.duration_sector_2 ?? null,
        s3: lapObj.duration_sector_3 ?? null,
      },
      compound: compoundForLap(stints, drv.driver_number, lapObj.lap_number),
      tyreAge: tyreAgeForLap(stints, drv.driver_number, lapObj.lap_number),
    };
    if (!samples.length) return { ...base, status: "no-telemetry" };
    grids[i] = resampleToGrid(deriveDistance(samples), TELEMETRY_GRID_POINTS);
    return { ...base, status: "ok" };
  });

  const chartData = grids[0] || grids[1] ? mergeDrivers(grids[0], grids[1]) : [];
  if (!chartData.length)
    return { ok: false, problem: `No telemetry is available for the selected lap in the ${year} ${meeting.meeting_name} ${sess.session_name}.` };

  const lapLabel = lap == null || lap === "fastest" ? "Fastest lap" : `Lap ${lap}`;
  downloadLapSummary(
    buildLapSummary({
      gpName: meeting.meeting_name,
      circuitName: meeting.circuit_short_name ?? meeting.meeting_name,
      sessionName: sess.session_name,
      lapLabel,
      drivers: reportDrivers,
      chartData,
      year,
    }),
  );

  const selection = {
    year,
    meetingKey: meeting.meeting_key,
    sessionKey: sess.session_key,
    driverNumbers: resolved.map((d) => d.driver_number),
    lapNumber: lap == null || lap === "fastest" ? null : Number(lap),
  };
  writeTelemetrySelection(selection);

  const names = reportDrivers.map((d) => d.name).join(" vs ");
  return {
    ok: true,
    summary: `${names} — ${year} ${meeting.meeting_name} ${sess.session_name}, ${lapLabel}`,
    selection,
  };
}
