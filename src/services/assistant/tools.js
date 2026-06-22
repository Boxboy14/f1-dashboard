// Registry of Gemini function declarations and their handlers. Declarations are
// plain JSON objects whose `type` strings match the SDK's Type enum, so this
// module needs no @google/genai import — the SDK boundary stays in gemini.js.
//
// Each handler is `async (args, { queryClient }) => result` returning plain JSON
// (no React, no hooks). On an expected data gap a handler returns
// `{ ok: false, problem }` rather than throwing; network/parse failures throw
// and the send loop turns them into a functionResponse error the model can
// apologise for (FR-015). Every successful data result includes a `page` route
// (+ `pageLabel`) so the UI can link to the matching app page (FR-009).
import { createDriverSlug } from "../../store/drivers/utils.js";
import { applySelectionToParams } from "../../utils/telemetry/selectionParams.js";
import { f1Fetch, matchDriver, resolveSession } from "./f1Resolvers.js";
import { buildAndDownloadReport } from "./telemetryReport.js";

const driverIndex = (drivers) =>
  new Map(drivers.map((d) => [d.driver_number, d]));
const nameOf = (idx, number) => idx.get(number)?.full_name ?? `#${number}`;
const teamOf = (idx, number) => idx.get(number)?.team_name ?? "—";

// The race session that fixes a season's standings: a specific round when
// `afterRound` is given, otherwise the most recent race that has run.
async function targetRaceSession(queryClient, year, afterRound) {
  const sessions = await f1Fetch.sessionsByYear(queryClient, year);
  const races = sessions
    .filter((s) => s.session_type === "Race")
    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  if (!races.length) return null;
  if (afterRound != null) return races[afterRound - 1] ?? races.at(-1);
  const now = Date.now();
  const past = races.filter((s) => new Date(s.date_start).getTime() <= now);
  return past.at(-1) ?? races.at(-1);
}

async function get_race_result(args, { queryClient }) {
  const { year, grand_prix, session: sessionName = "Race" } = args;
  const { meeting, session } = await resolveSession(queryClient, {
    year,
    grandPrix: grand_prix,
    session: sessionName,
  });
  if (!meeting)
    return { ok: false, problem: `Couldn't find a ${year} Grand Prix matching "${grand_prix}".` };
  if (!session)
    return { ok: false, problem: `Couldn't find a "${sessionName}" session for the ${year} ${meeting.meeting_name}.` };

  const [results, drivers] = await Promise.all([
    f1Fetch.sessionResult(queryClient, session.session_key),
    f1Fetch.drivers(queryClient, session.session_key),
  ]);
  if (!results.length)
    return { ok: false, problem: `No results are available yet for the ${year} ${meeting.meeting_name} ${session.session_name}.` };

  const idx = driverIndex(drivers);
  const classification = [...results]
    .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
    .map((r) => ({
      position: r.position ?? null,
      driver: nameOf(idx, r.driver_number),
      team: teamOf(idx, r.driver_number),
      status: r.dsq ? "DSQ" : r.dnf ? "DNF" : r.dns ? "DNS" : "Finished",
    }));

  return {
    year,
    grand_prix: meeting.meeting_name,
    session: session.session_name,
    classification,
    page: `/sessions/${session.session_key}`,
    pageLabel: `${year} ${meeting.meeting_name} — ${session.session_name}`,
  };
}

async function get_championship_standings(args, { queryClient }) {
  const { year, type, after_round } = args;
  const session = await targetRaceSession(queryClient, year, after_round);
  if (!session)
    return { ok: false, problem: `No race data is available for the ${year} season.` };

  if (type === "constructor") {
    const teams = await f1Fetch.championshipTeams(queryClient, session.session_key);
    if (!teams.length)
      return { ok: false, problem: `Constructor standings aren't available for ${year} yet.` };
    const standings = [...teams]
      .sort((a, b) => a.position_current - b.position_current)
      .map((t) => ({
        position: t.position_current,
        name: t.team_name,
        points: t.points_current,
      }));
    return { year, type, standings, page: "/teams", pageLabel: `${year} Constructor standings` };
  }

  const [champ, drivers] = await Promise.all([
    f1Fetch.championshipDrivers(queryClient, session.session_key),
    f1Fetch.drivers(queryClient, session.session_key),
  ]);
  if (!champ.length)
    return { ok: false, problem: `Driver standings aren't available for ${year} yet.` };
  const idx = driverIndex(drivers);
  const standings = [...champ]
    .sort((a, b) => a.position_current - b.position_current)
    .map((s) => ({
      position: s.position_current,
      name: nameOf(idx, s.driver_number),
      team: teamOf(idx, s.driver_number),
      points: s.points_current,
    }));
  return { year, type: "driver", standings, page: "/drivers", pageLabel: `${year} Driver standings` };
}

async function get_driver_season(args, { queryClient }) {
  const { year, driver: query } = args;
  const session = await targetRaceSession(queryClient, year);
  if (!session)
    return { ok: false, problem: `No race data is available for the ${year} season.` };

  const [drivers, champ] = await Promise.all([
    f1Fetch.drivers(queryClient, session.session_key),
    f1Fetch.championshipDrivers(queryClient, session.session_key),
  ]);
  const driver = matchDriver(drivers, query);
  if (!driver)
    return { ok: false, problem: `Couldn't find a driver matching "${query}" in the ${year} season.` };

  const standing = champ.find((s) => s.driver_number === driver.driver_number);
  return {
    year,
    driver: driver.full_name,
    team: driver.team_name ?? "—",
    points: standing?.points_current ?? null,
    position: standing?.position_current ?? null,
    page: `/drivers/${createDriverSlug(driver)}`,
    pageLabel: `${driver.full_name} — ${year}`,
  };
}

async function get_event_schedule(args, { queryClient }) {
  const { year, grand_prix } = args;
  const meetings = await f1Fetch.meetings(queryClient, year);
  if (!meetings.length)
    return { ok: false, problem: `No calendar is available for the ${year} season.` };

  const now = Date.now();
  let events = meetings
    .filter((m) => !m.meeting_name.toLowerCase().includes("testing"))
    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
    .map((m, i) => ({
      round: i + 1,
      name: m.meeting_name,
      country: m.country_name,
      date_start: m.date_start,
      status: m.is_cancelled
        ? "Cancelled"
        : new Date(m.date_start).getTime() < now
          ? "Completed"
          : "Upcoming",
    }));

  if (grand_prix) {
    const q = grand_prix.toLowerCase().replace(/grand prix|gp/g, "").trim();
    const matched = events.filter((e) =>
      `${e.name} ${e.country}`.toLowerCase().includes(q),
    );
    if (matched.length) events = matched;
  }

  return { year, events, page: `/seasons?year=${year}`, pageLabel: `${year} F1 calendar` };
}

async function get_session_extras(args, { queryClient }) {
  const { year, grand_prix, session: sessionName = "Race", kind } = args;

  // Pole always comes from Qualifying regardless of the session the user named.
  if (kind === "pole") {
    const { meeting, session: quali } = await resolveSession(queryClient, {
      year,
      grandPrix: grand_prix,
      session: "Qualifying",
    });
    if (!meeting)
      return { ok: false, problem: `Couldn't find a ${year} Grand Prix matching "${grand_prix}".` };
    if (!quali)
      return { ok: false, problem: `Couldn't find a Qualifying session for the ${year} ${meeting.meeting_name}.` };

    const [results, drivers] = await Promise.all([
      f1Fetch.sessionResult(queryClient, quali.session_key),
      f1Fetch.drivers(queryClient, quali.session_key),
    ]);
    const p1 = results.find((r) => r.position === 1);
    if (!p1)
      return { ok: false, problem: `Pole position isn't available for the ${year} ${meeting.meeting_name}.` };
    const idx = driverIndex(drivers);
    return {
      year,
      grand_prix: meeting.meeting_name,
      kind,
      pole: { driver: nameOf(idx, p1.driver_number), team: teamOf(idx, p1.driver_number) },
      page: `/sessions/${quali.session_key}`,
      pageLabel: `${year} ${meeting.meeting_name} — Qualifying`,
    };
  }

  const { meeting, session } = await resolveSession(queryClient, {
    year,
    grandPrix: grand_prix,
    session: sessionName,
  });
  if (!meeting)
    return { ok: false, problem: `Couldn't find a ${year} Grand Prix matching "${grand_prix}".` };
  if (!session)
    return { ok: false, problem: `Couldn't find a "${sessionName}" session for the ${year} ${meeting.meeting_name}.` };

  const pageLabel = `${year} ${meeting.meeting_name} — ${session.session_name}`;
  const page = `/sessions/${session.session_key}`;

  if (kind === "pit_stops") {
    const [pits, drivers] = await Promise.all([
      f1Fetch.pit(queryClient, session.session_key),
      f1Fetch.drivers(queryClient, session.session_key),
    ]);
    if (!pits.length)
      return { ok: false, problem: `No pit-stop data is available for the ${year} ${meeting.meeting_name} ${session.session_name}.` };
    const idx = driverIndex(drivers);
    const pit_stops = [...pits]
      .sort((a, b) => a.lap_number - b.lap_number || new Date(a.date) - new Date(b.date))
      .map((p) => ({
        driver: nameOf(idx, p.driver_number),
        lap_number: p.lap_number,
        pit_duration: p.pit_duration ?? null,
      }));
    return { year, grand_prix: meeting.meeting_name, session: session.session_name, kind, pit_stops, page, pageLabel };
  }

  if (kind === "fastest_lap") {
    const laps = await f1Fetch.lapsBySession(queryClient, session.session_key);
    const valid = laps.filter((l) => l.lap_duration != null && !l.is_pit_out_lap);
    if (!valid.length)
      return { ok: false, problem: `No lap-time data is available for the ${year} ${meeting.meeting_name} ${session.session_name}.` };
    const fastest = valid.reduce((a, b) => (b.lap_duration < a.lap_duration ? b : a));
    const drivers = await f1Fetch.drivers(queryClient, session.session_key);
    const idx = driverIndex(drivers);
    return {
      year,
      grand_prix: meeting.meeting_name,
      session: session.session_name,
      kind,
      fastest_lap: {
        driver: nameOf(idx, fastest.driver_number),
        lap_number: fastest.lap_number,
        lap_time: fastest.lap_duration,
      },
      page,
      pageLabel,
    };
  }

  return { ok: false, problem: `Unsupported extra "${kind}".` };
}

// Backstop validation: the system prompt gathers all four fields first, but
// guard against a premature call so we never build an empty report (FR-012).
async function download_telemetry_report(args, { queryClient }) {
  const { year, grand_prix, session, drivers, lap } = args;
  const missing = [];
  if (!year) missing.push("year");
  if (!grand_prix) missing.push("grand_prix");
  if (!session) missing.push("session");
  if (!Array.isArray(drivers) || drivers.length === 0) missing.push("drivers");
  if (lap == null || lap === "") missing.push("lap");
  if (missing.length)
    return { ok: false, problem: "Some report details are still missing.", missing };

  if (drivers.length > 2)
    return { ok: false, problem: "A report compares at most two drivers — pick one or two." };

  const result = await buildAndDownloadReport({
    queryClient,
    year,
    grandPrix: grand_prix,
    session,
    drivers,
    lap,
  });
  if (!result.ok) return result;
  // Encode the exact selection into the link so it deep-links to these drivers
  // even when the Telemetry page is already open on the same season (no remount).
  const { selection, ...rest } = result;
  const params = applySelectionToParams(
    new URLSearchParams({ year: String(year) }),
    selection,
  );
  return { ...rest, page: `/telemetry?${params.toString()}`, pageLabel: "Open the telemetry comparison" };
}

const YEAR_PARAM = {
  type: "INTEGER",
  description: "Season year. Only 2023, 2024, and 2025 are supported.",
};

export const functionDeclarations = [
  {
    name: "get_race_result",
    description:
      "Get the winner, podium, or full classification for a Grand Prix session in 2023–2025.",
    parameters: {
      type: "OBJECT",
      properties: {
        year: YEAR_PARAM,
        grand_prix: { type: "STRING", description: 'Grand Prix or location, e.g. "Monaco" or "British Grand Prix".' },
        session: { type: "STRING", description: 'Session name; defaults to "Race". E.g. "Race", "Qualifying", "Sprint".' },
      },
      required: ["year", "grand_prix"],
    },
  },
  {
    name: "get_championship_standings",
    description: "Get driver or constructor championship standings for a 2023–2025 season.",
    parameters: {
      type: "OBJECT",
      properties: {
        year: YEAR_PARAM,
        type: { type: "STRING", description: 'Either "driver" or "constructor".' },
        after_round: { type: "INTEGER", description: "Optional round number to get standings as of that round." },
      },
      required: ["year", "type"],
    },
  },
  {
    name: "get_driver_season",
    description:
      "Get a driver's 2023–2025 season summary: team, championship points, and position.",
    parameters: {
      type: "OBJECT",
      properties: {
        year: YEAR_PARAM,
        driver: { type: "STRING", description: 'Driver name, surname, three-letter acronym, or car number, e.g. "Verstappen", "VER", or "1".' },
      },
      required: ["year", "driver"],
    },
  },
  {
    name: "get_event_schedule",
    description:
      "Get the race calendar for a 2023–2025 season, or find when a specific Grand Prix is/was held.",
    parameters: {
      type: "OBJECT",
      properties: {
        year: YEAR_PARAM,
        grand_prix: { type: "STRING", description: "Optional Grand Prix or location to narrow to a single event." },
      },
      required: ["year"],
    },
  },
  {
    name: "get_session_extras",
    description:
      "Get pit stops, the fastest lap, or pole position for a 2023–2025 Grand Prix session.",
    parameters: {
      type: "OBJECT",
      properties: {
        year: YEAR_PARAM,
        grand_prix: { type: "STRING", description: 'Grand Prix or location, e.g. "Monza".' },
        session: { type: "STRING", description: 'Session name; defaults to "Race". Ignored for pole (always Qualifying).' },
        kind: { type: "STRING", description: 'One of "pit_stops", "fastest_lap", or "pole".' },
      },
      required: ["year", "grand_prix", "kind"],
    },
  },
  {
    name: "download_telemetry_report",
    description:
      "Build and download a one- or two-driver telemetry comparison report for a 2023–2025 Grand Prix session. Only call this once you have all of: year, grand_prix, session, drivers, and lap.",
    parameters: {
      type: "OBJECT",
      properties: {
        year: YEAR_PARAM,
        grand_prix: { type: "STRING", description: 'Grand Prix or location, e.g. "Monaco".' },
        session: { type: "STRING", description: 'Session name, e.g. "Race" or "Qualifying".' },
        drivers: {
          type: "ARRAY",
          description: "One or two drivers (name, surname, acronym, or car number).",
          items: { type: "STRING" },
        },
        lap: { type: "STRING", description: 'A lap number (e.g. "12") or the word "fastest".' },
      },
      required: ["year", "grand_prix", "session", "drivers", "lap"],
    },
  },
];

export const handlers = {
  get_race_result,
  get_championship_standings,
  get_driver_season,
  get_event_schedule,
  get_session_extras,
  download_telemetry_report,
};
