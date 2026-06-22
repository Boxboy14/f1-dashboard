// Turns the loose names a user types ("Monaco", "quali", "Verstappen") into the
// keys/numbers OpenF1 needs. Every fetch goes through queryClient.fetchQuery
// over openF1Api so it shares the pages' TanStack cache, is paced by the rate
// limiter, and is tagged meta:{ background: true } so the GlobalLoadingOverlay
// never counts assistant traffic (Constitution Article IV; research.md §5).
import { openF1Api } from "../api/openf1.js";
import { transformDrivers } from "../../hooks/useOpenF1.js";

const STALE = { short: 5 * 60 * 1000, long: 10 * 60 * 1000, lap: 30 * 60 * 1000 };

function fetchQ(queryClient, queryKey, queryFn, staleTime) {
  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime,
    meta: { background: true },
  });
}

// Query keys mirror useOpenF1.js exactly so a page and the assistant share one
// cache entry (never the same call from two places). The drivers fetch reuses
// the hook's transform so the cached shape stays identical for both readers.
export const f1Fetch = {
  meetings: (qc, year) =>
    fetchQ(qc, ["meetings", { year }], () => openF1Api.meetings({ year }), STALE.long),
  sessionsByMeeting: (qc, meeting_key) =>
    fetchQ(qc, ["sessions", { meeting_key }], () => openF1Api.sessions({ meeting_key }), STALE.short),
  sessionsByYear: (qc, year) =>
    fetchQ(qc, ["sessions", { year }], () => openF1Api.sessions({ year }), STALE.short),
  drivers: (qc, session_key) =>
    fetchQ(
      qc,
      ["drivers", { session_key }],
      async () => transformDrivers(await openF1Api.drivers({ session_key })),
      STALE.short,
    ),
  sessionResult: (qc, session_key) =>
    fetchQ(qc, ["session_result", { session_key }], () => openF1Api.sessionResult({ session_key }), STALE.short),
  championshipDrivers: (qc, session_key) =>
    fetchQ(qc, ["championship_drivers", { session_key }], () => openF1Api.championshipDrivers({ session_key }), STALE.long),
  championshipTeams: (qc, session_key) =>
    fetchQ(qc, ["championship_teams", { session_key }], () => openF1Api.championshipTeams({ session_key }), STALE.long),
  pit: (qc, session_key) =>
    fetchQ(qc, ["pit", { session_key }], () => openF1Api.pit({ session_key }), STALE.short),
  laps: (qc, session_key, driver_number) =>
    fetchQ(qc, ["laps", { session_key, driver_number }], () => openF1Api.laps({ session_key, driver_number }), STALE.short),
  // Whole-session laps in one request (distinct key from the per-driver fetch);
  // used to find a session's fastest lap without 20 per-driver calls.
  lapsBySession: (qc, session_key) =>
    fetchQ(qc, ["laps", { session_key }], () => openF1Api.laps({ session_key }), STALE.short),
  stints: (qc, session_key) =>
    fetchQ(qc, ["stints", { session_key }], () => openF1Api.stints({ session_key }), STALE.short),
  carDataLap: (qc, params) =>
    fetchQ(qc, ["car_data_lap", params], () => openF1Api.carDataLap(params), STALE.lap),
};

// "Monaco Grand Prix" / "GP" noise removed, punctuation flattened, lowercased.
const STOPWORDS = /\b(grand prix|grandprix|gp)\b/g;
const normalize = (s) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .replace(STOPWORDS, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Score each meeting's searchable fields against the query; best match wins.
function matchMeeting(meetings, grandPrix) {
  const q = normalize(grandPrix);
  if (!q || !meetings?.length) return null;

  const scored = meetings
    .filter((m) => !normalize(m.meeting_name).includes("testing"))
    .map((m) => {
      const candidates = [
        m.meeting_name,
        m.country_name,
        m.circuit_short_name,
        m.meeting_official_name,
      ].map(normalize);
      let score = 0;
      for (const c of candidates) {
        if (!c) continue;
        if (c === q) score = Math.max(score, 3);
        else if (c.includes(q) || q.includes(c)) score = Math.max(score, 2);
        else if (c.split(" ").some((w) => w.length > 2 && q.includes(w)))
          score = Math.max(score, 1);
      }
      return { m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.m ?? null;
}

const SESSION_ALIASES = {
  race: "Race",
  qualifying: "Qualifying",
  quali: "Qualifying",
  q: "Qualifying",
  sprint: "Sprint",
  "sprint race": "Sprint",
  "sprint qualifying": "Sprint Qualifying",
  "sprint shootout": "Sprint Qualifying",
  fp1: "Practice 1",
  fp2: "Practice 2",
  fp3: "Practice 3",
  "practice 1": "Practice 1",
  "practice 2": "Practice 2",
  "practice 3": "Practice 3",
};

function matchSession(sessions, sessionName) {
  if (!sessions?.length) return null;
  const q = normalize(sessionName || "race");

  const exact = sessions.find((s) => normalize(s.session_name) === q);
  if (exact) return exact;

  const canonical = SESSION_ALIASES[q];
  if (canonical) {
    const byAlias = sessions.find(
      (s) =>
        normalize(s.session_name) === normalize(canonical) ||
        normalize(s.session_type) === normalize(canonical),
    );
    if (byAlias) return byAlias;
  }

  return (
    sessions.find(
      (s) =>
        normalize(s.session_name).includes(q) ||
        q.includes(normalize(s.session_name)),
    ) ?? null
  );
}

// `query` may be a number, a "#44", an acronym (VER), a surname, or a full name.
export function matchDriver(drivers, query) {
  if (query == null || !drivers?.length) return null;
  const raw = String(query).trim().replace(/^#/, "");
  if (/^\d+$/.test(raw)) {
    return drivers.find((d) => d.driver_number === Number(raw)) ?? null;
  }
  const q = normalize(raw);
  if (!q) return null;
  return (
    drivers.find((d) => normalize(d.name_acronym) === q) ??
    drivers.find((d) => normalize(d.last_name) === q) ??
    drivers.find((d) => normalize(d.full_name) === q) ??
    drivers.find(
      (d) =>
        normalize(d.full_name).includes(q) ||
        (normalize(d.last_name) && q.includes(normalize(d.last_name))),
    ) ??
    null
  );
}

// Resolve a Grand Prix to its meeting, then to one of its sessions (default
// Race). Returns { meeting, session } with either field null when unresolved so
// callers can report exactly which part failed.
export async function resolveSession(queryClient, { year, grandPrix, session = "Race" }) {
  const meetings = await f1Fetch.meetings(queryClient, year);
  const meeting = matchMeeting(meetings, grandPrix);
  if (!meeting) return { meeting: null, session: null };

  const sessions = await f1Fetch.sessionsByMeeting(queryClient, meeting.meeting_key);
  return { meeting, session: matchSession(sessions, session) };
}
