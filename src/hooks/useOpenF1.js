import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { openF1Api } from "../services/api/openf1.js";
import { COUNTRY_CODE_MAP } from "../constants/countryMap.js";
import { deriveSessionStatus, deriveMeetingStatus } from "../utils/sessionStatus.js";
import {
  deriveDistance,
  resampleToGrid,
  mergeDrivers,
  deriveTrackDistance,
  resampleTrack,
  buildDominance,
  buildSpeedShade,
} from "../utils/telemetry.js";

function transformDrivers(data) {
  if (!data) return [];
  return data.map((driver) => ({
    ...driver,
    full_name: `${driver.first_name} ${driver.last_name}`,
    country_name: COUNTRY_CODE_MAP[driver.country_code] ?? driver.country_code,
  }));
}

function useDrivers(params, options) {
  return useQuery({
    queryKey: ["drivers", params],
    queryFn: async () => {
      const data = await openF1Api.drivers(params);
      return transformDrivers(data);
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

function useDriversByYear(year) {
  const { data: sessions = [] } = useSessions({ year, session_type: "Race" });
  const lastSessionKey = sessions.at(-1)?.session_key;
  return useDrivers(
    { session_key: lastSessionKey },
    { enabled: Boolean(lastSessionKey) }
  );
}

function useSessions(params, options) {
  return useQuery({
    queryKey: ["sessions", params],
    queryFn: () => openF1Api.sessions(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

function useMeetings(params, options) {
  return useQuery({
    queryKey: ["meetings", params],
    queryFn: () => openF1Api.meetings(params),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

function useLaps(params, options) {
  return useQuery({
    queryKey: ["laps", params],
    queryFn: () => openF1Api.laps(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key && params?.driver_number),
    ...options,
  });
}

function useChampionshipDrivers(params, options) {
  return useQuery({
    queryKey: ["championship_drivers", params],
    queryFn: () => openF1Api.championshipDrivers(params),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

function useChampionshipTeams(params, options) {
  return useQuery({
    queryKey: ["championship_teams", params],
    queryFn: () => openF1Api.championshipTeams(params),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

function useSessionResult(params, options) {
  return useQuery({
    queryKey: ["session_result", params],
    queryFn: () => openF1Api.sessionResult(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key),
    ...options,
  });
}

function useStartingGrid(params, options) {
  return useQuery({
    queryKey: ["starting_grid", params],
    queryFn: () => openF1Api.startingGrid(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key),
    ...options,
  });
}

function usePit(params, options) {
  return useQuery({
    queryKey: ["pit", params],
    queryFn: () => openF1Api.pit(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key),
    ...options,
  });
}

function useStints(params, options) {
  return useQuery({
    queryKey: ["stints", params],
    queryFn: () => openF1Api.stints(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key),
    ...options,
  });
}

function useCarData(params, options) {
  return useQuery({
    queryKey: ["car_data", params],
    queryFn: () => openF1Api.carData(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key && params?.driver_number),
    ...options,
  });
}

function useCarDataLap(params, options) {
  return useQuery({
    queryKey: ["car_data_lap", params],
    queryFn: () => openF1Api.carDataLap(params),
    staleTime: 30 * 60 * 1000,
    enabled: Boolean(
      params?.session_key &&
        params?.driver_number &&
        params?.date_gte &&
        params?.date_lt
    ),
    ...options,
  });
}

function useLocationLap(params, options) {
  return useQuery({
    queryKey: ["location_lap", params],
    queryFn: () => openF1Api.locationLap(params),
    staleTime: 30 * 60 * 1000,
    enabled: Boolean(
      params?.session_key &&
        params?.driver_number &&
        params?.date_gte &&
        params?.date_lt
    ),
    ...options,
  });
}

function useWeather(params, options) {
  return useQuery({
    queryKey: ["weather", params],
    queryFn: () => openF1Api.weather(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.meeting_key),
    ...options,
  });
}

function useRaceControl(params, options) {
  return useQuery({
    queryKey: ["race_control", params],
    queryFn: () => openF1Api.raceControl(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key),
    ...options,
  });
}

function useOvertakes(params, options) {
  return useQuery({
    queryKey: ["overtakes", params],
    queryFn: () => openF1Api.overtakes(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key),
    ...options,
  });
}

function useTeamsByYear(year) {
  const { data: sessions = [] } = useSessions({ year, session_type: "Race" });
  const lastSessionKey = sessions.at(-1)?.session_key;

  const { data: teamStandings = [], isLoading: isLoadingTeams } =
    useChampionshipTeams(
      { session_key: lastSessionKey },
      { enabled: Boolean(lastSessionKey) }
    );

  const { data: driverStandings = [], isLoading: isLoadingDriverStandings } =
    useChampionshipDrivers(
      { session_key: lastSessionKey },
      { enabled: Boolean(lastSessionKey) }
    );

  const { data: drivers = [], isLoading: isLoadingDrivers } = useDrivers(
    { session_key: lastSessionKey },
    { enabled: Boolean(lastSessionKey) }
  );

  const isLoading =
    !lastSessionKey ||
    isLoadingTeams ||
    isLoadingDriverStandings ||
    isLoadingDrivers;

  const data = useMemo(() => {
    if (!teamStandings.length || !drivers.length) return [];

    const driverStandingMap = new Map(
      driverStandings.map((ds) => [ds.driver_number, ds])
    );

    const driversByTeam = new Map();
    for (const driver of drivers) {
      const standing = driverStandingMap.get(driver.driver_number);
      const enriched = {
        driver_number: driver.driver_number,
        full_name: driver.full_name,
        headshot_url: driver.headshot_url,
        team_colour: driver.team_colour,
        championship: standing
          ? {
              position_current: standing.position_current,
              points_current: standing.points_current,
            }
          : null,
      };
      const existing = driversByTeam.get(driver.team_name) ?? [];
      driversByTeam.set(driver.team_name, [...existing, enriched]);
    }

    return teamStandings
      .map((team) => ({
        team_name: team.team_name,
        position_current: team.position_current,
        points_current: team.points_current,
        team_colour: driversByTeam.get(team.team_name)?.[0]?.team_colour ?? null,
        drivers: driversByTeam.get(team.team_name) ?? [],
      }))
      .sort((a, b) => a.position_current - b.position_current);
  }, [teamStandings, driverStandings, drivers]);

  return { data, isLoading };
}

function useMeetingDetail(meetingKey) {
  const { data: meetings = [], isLoading: isLoadingMeeting } = useMeetings(
    { meeting_key: meetingKey },
    { enabled: Boolean(meetingKey) }
  );

  const { data: rawSessions = [], isLoading: isLoadingSessions } = useSessions(
    { meeting_key: meetingKey },
    { enabled: Boolean(meetingKey) }
  );

  const sessions = useMemo(() => {
    if (!rawSessions.length) return [];
    const isCancelled = meetings[0]?.is_cancelled;
    return [...rawSessions]
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
      .map((s) => ({ ...s, status: deriveSessionStatus(s, isCancelled) }));
  }, [rawSessions, meetings]);

  return {
    meeting: meetings[0] ?? null,
    sessions,
    isLoading: Boolean(meetingKey) && (isLoadingMeeting || isLoadingSessions),
  };
}

function useSessionDetail(sessionKey) {
  const { data: sessions = [], isLoading: isLoadingSessions } = useSessions(
    { session_key: sessionKey },
    { enabled: Boolean(sessionKey) }
  );

  // The Grand Prix name lives on /meetings, not /sessions — fetched once the
  // session resolves its meeting_key (dedupes with the meeting-page query).
  const meetingKey = sessions[0]?.meeting_key;
  const { data: meetings = [] } = useMeetings(
    { meeting_key: meetingKey },
    { enabled: Boolean(meetingKey) }
  );

  const { data: rawResults = [], isLoading: isLoadingResults } = useSessionResult(
    { session_key: sessionKey },
    { enabled: Boolean(sessionKey) }
  );

  const { data: drivers = [], isLoading: isLoadingDrivers } = useDrivers(
    { session_key: sessionKey },
    { enabled: Boolean(sessionKey) }
  );

  const { data: rawPitStops = [], isLoading: isLoadingPit } = usePit(
    { session_key: sessionKey },
    { enabled: Boolean(sessionKey) }
  );

  const { results, pitStops } = useMemo(() => {
    const driverMap = new Map(
      drivers.map((d) => [
        d.driver_number,
        {
          full_name: d.full_name ?? String(d.driver_number),
          name_acronym: d.name_acronym,
          team_name: d.team_name ?? "—",
          team_colour: d.team_colour,
        },
      ])
    );

    const sessionType = sessions[0]?.session_type ?? "";
    const isRaceType = ["Race", "Sprint"].includes(sessionType);
    const isQualifyingType = sessionType.includes("Qualifying");

    const enrichedResults = [...rawResults]
      .sort((a, b) => a.position - b.position)
      .map((r) => {
        const driver = driverMap.get(r.driver_number) ?? {};
        const status = r.dsq ? "DSQ" : r.dnf ? "DNF" : r.dns ? "DNS" : "Finished";
        let best_time = null;
        if (!isRaceType) {
          if (isQualifyingType && Array.isArray(r.duration)) {
            const times = r.duration.filter((t) => t != null);
            best_time = times.at(-1) ?? null;
          } else if (!isQualifyingType) {
            best_time = r.duration ?? null;
          }
        }
        return {
          ...r,
          full_name: driver.full_name ?? String(r.driver_number),
          name_acronym: driver.name_acronym,
          team_name: driver.team_name ?? "—",
          team_colour: driver.team_colour,
          status,
          best_time,
        };
      });

    const enrichedPitStops = [...rawPitStops]
      .sort(
        (a, b) =>
          a.lap_number - b.lap_number || new Date(a.date) - new Date(b.date)
      )
      .map((p) => {
        const driver = driverMap.get(p.driver_number) ?? {};
        return {
          ...p,
          full_name: driver.full_name ?? String(p.driver_number),
          team_name: driver.team_name ?? "—",
        };
      });

    return { results: enrichedResults, pitStops: enrichedPitStops };
  }, [rawResults, drivers, rawPitStops, sessions]);

  return {
    session: sessions[0] ?? null,
    gpName: meetings[0]?.meeting_name ?? "",
    results,
    pitStops,
    isLoading:
      Boolean(sessionKey) &&
      (isLoadingSessions || isLoadingResults || isLoadingDrivers || isLoadingPit),
  };
}

function useRaceCalendar(year) {
  const { data: meetings = [], isLoading } = useMeetings({ year });

  const data = useMemo(() => {
    if (!meetings.length) return [];

    return meetings
      .filter((m) => !m.meeting_name.toLowerCase().includes("testing"))
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
      .map((m, index) => ({
        meeting_key: m.meeting_key,
        round: index + 1,
        meeting_name: m.meeting_name,
        circuit_short_name: m.circuit_short_name,
        country_name: m.country_name,
        country_flag: m.country_flag,
        date_start: m.date_start,
        is_cancelled: m.is_cancelled,
        status: m.is_cancelled
          ? "Cancelled"
          : new Date(m.date_start) < new Date()
          ? "Completed"
          : "Upcoming",
      }));
  }, [meetings]);

  return { data, isLoading };
}

function useSeasonGrandPrix(year) {
  const { data: meetings = [], isLoading: isLoadingMeetings } = useMeetings({
    year,
  });
  const { data: rawSessions = [], isLoading: isLoadingSessions } = useSessions({
    year,
  });

  const grandPrix = useMemo(() => {
    if (!meetings.length) return [];

    const sessionsByMeeting = new Map();
    for (const s of rawSessions) {
      const list = sessionsByMeeting.get(s.meeting_key) ?? [];
      list.push(s);
      sessionsByMeeting.set(s.meeting_key, list);
    }

    return meetings
      .filter((m) => !m.meeting_name.toLowerCase().includes("testing"))
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
      .map((m, index) => {
        const group = (sessionsByMeeting.get(m.meeting_key) ?? [])
          .slice()
          .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));

        const sessions = group.map((s) => ({
          session_key: s.session_key,
          session_name: s.session_name,
          session_type: s.session_type,
          date_start: s.date_start,
          status: deriveSessionStatus(s, m.is_cancelled),
        }));

        const ends = group
          .map((s) => s.date_end)
          .filter(Boolean)
          .sort((a, b) => new Date(a) - new Date(b));

        return {
          meeting_key: m.meeting_key,
          round: index + 1,
          meeting_name: m.meeting_name,
          country_name: m.country_name,
          country_flag: m.country_flag,
          circuit_short_name: m.circuit_short_name,
          date_start: group[0]?.date_start ?? m.date_start,
          date_end: ends.at(-1) ?? null,
          status: deriveMeetingStatus(sessions, m.is_cancelled),
          raceSessionKey:
            group.find((s) => s.session_type === "Race")?.session_key ?? null,
        };
      });
  }, [meetings, rawSessions]);

  return { grandPrix, isLoading: isLoadingMeetings || isLoadingSessions };
}

function useSeasonKpis(year) {
  const { data: sessions = [], isLoading: isLoadingSessions } = useSessions({
    year,
  });
  const { data: meetings = [] } = useMeetings({ year });

  const { lastRaceKey, lastRaceMeetingKey, nextRaceSession } = useMemo(() => {
    const now = new Date();
    const races = sessions
      .filter((s) => s.session_type === "Race")
      .slice()
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
    const isPast = (s) =>
      s.date_end ? new Date(s.date_end) < now : new Date(s.date_start) < now;
    const lastRace = races.filter(isPast).at(-1) ?? null;
    const nextRace = races.find((s) => new Date(s.date_start) > now) ?? null;
    return {
      lastRaceKey: lastRace?.session_key ?? null,
      lastRaceMeetingKey: lastRace?.meeting_key ?? null,
      nextRaceSession: nextRace,
    };
  }, [sessions]);

  const enabled = { enabled: Boolean(lastRaceKey) };
  const { data: driverStandings = [], isLoading: isLoadingStandings } =
    useChampionshipDrivers({ session_key: lastRaceKey }, enabled);
  const { data: drivers = [], isLoading: isLoadingDrivers } = useDrivers(
    { session_key: lastRaceKey },
    enabled
  );
  const { data: results = [], isLoading: isLoadingResults } = useSessionResult(
    { session_key: lastRaceKey },
    enabled
  );

  const kpis = useMemo(() => {
    const driverMap = new Map(drivers.map((d) => [d.driver_number, d]));

    const topDriver = [...driverStandings].sort(
      (a, b) => a.position_current - b.position_current
    )[0];
    const leader = topDriver
      ? {
          full_name:
            driverMap.get(topDriver.driver_number)?.full_name ??
            String(topDriver.driver_number),
          team_name: driverMap.get(topDriver.driver_number)?.team_name ?? "—",
          points: topDriver.points_current,
          position: topDriver.position_current,
        }
      : null;

    const winnerResult = results.find((r) => r.position === 1);
    const lastWinner = winnerResult
      ? {
          full_name:
            driverMap.get(winnerResult.driver_number)?.full_name ??
            String(winnerResult.driver_number),
          team_name:
            driverMap.get(winnerResult.driver_number)?.team_name ?? "—",
          meeting_name:
            meetings.find((m) => m.meeting_key === lastRaceMeetingKey)
              ?.meeting_name ?? "—",
        }
      : null;

    let nextRace = null;
    if (nextRaceSession) {
      const meeting = meetings.find(
        (m) => m.meeting_key === nextRaceSession.meeting_key
      );
      const msUntil =
        new Date(nextRaceSession.date_start).getTime() - new Date().getTime();
      nextRace = {
        meeting_name: meeting?.meeting_name ?? "—",
        country_flag: meeting?.country_flag ?? null,
        date_start: nextRaceSession.date_start,
        daysUntil: Math.max(0, Math.ceil(msUntil / 86_400_000)),
      };
    }

    return { leader, lastWinner, nextRace };
  }, [driverStandings, drivers, results, meetings, lastRaceMeetingKey, nextRaceSession]);

  return {
    kpis,
    isLoading:
      isLoadingSessions ||
      (Boolean(lastRaceKey) &&
        (isLoadingStandings || isLoadingDrivers || isLoadingResults)),
  };
}

const TELEMETRY_GRID_POINTS = 400;

// One driver's fastest-lap telemetry: find the fastest valid lap, then fetch
// only that lap's car_data window (dependent fetch).
function useDriverLapTelemetry(sessionKey, driverNumber, lapNumber) {
  const { data: laps = [], isLoading: lapsLoading } = useLaps(
    { session_key: sessionKey, driver_number: driverNumber },
    { enabled: Boolean(sessionKey && driverNumber) }
  );

  // lapNumber === null → fastest valid lap; otherwise the requested lap.
  const lap = useMemo(() => {
    const valid = laps.filter(
      (l) => l.lap_duration != null && !l.is_pit_out_lap
    );
    if (!valid.length) return null;
    if (lapNumber == null) {
      return valid.reduce((a, b) => (b.lap_duration < a.lap_duration ? b : a));
    }
    return valid.find((l) => l.lap_number === lapNumber) ?? null;
  }, [laps, lapNumber]);

  const dateLt = lap
    ? new Date(
        new Date(lap.date_start).getTime() + lap.lap_duration * 1000
      ).toISOString()
    : null;

  const { data: samples = [], isLoading: carLoading } = useCarDataLap({
    session_key: sessionKey,
    driver_number: driverNumber,
    date_gte: lap?.date_start ?? null,
    date_lt: dateLt,
  });

  return {
    lap,
    laps,
    samples,
    isLoading:
      Boolean(driverNumber) && (lapsLoading || (Boolean(lap) && carLoading)),
  };
}

function useTelemetryComparison(sessionKey, driverNumbers = [], lapNumber = null) {
  const slotA = driverNumbers[0] ?? null;
  const slotB = driverNumbers[1] ?? null;

  // Two fixed slots → constant hook count whether 1 or 2 drivers are selected.
  const a = useDriverLapTelemetry(sessionKey, slotA, lapNumber);
  const b = useDriverLapTelemetry(sessionKey, slotB, lapNumber);

  const { data: drivers = [] } = useDrivers(
    { session_key: sessionKey },
    { enabled: Boolean(sessionKey) }
  );

  // Union of both drivers' selectable (timed, non-out) lap numbers, for the
  // shared Lap dropdown.
  const lapNumbers = useMemo(() => {
    const set = new Set();
    for (const list of [a.laps, b.laps]) {
      for (const l of list ?? []) {
        if (l.lap_duration != null && !l.is_pit_out_lap) set.add(l.lap_number);
      }
    }
    return [...set].sort((x, y) => x - y);
  }, [a.laps, b.laps]);

  // The track outline is drawn from one driver's lap position trace — slot A if
  // it has data, otherwise slot B.
  const outline = useMemo(() => {
    if (a.lap && a.samples.length) {
      return { dn: slotA, lap: a.lap, slot: 0, suffix: "a" };
    }
    if (b.lap && b.samples.length) {
      return { dn: slotB, lap: b.lap, slot: 1, suffix: "b" };
    }
    return null;
  }, [a.lap, a.samples, b.lap, b.samples, slotA, slotB]);
  const outlineDateLt = outline
    ? new Date(
        new Date(outline.lap.date_start).getTime() +
          outline.lap.lap_duration * 1000
      ).toISOString()
    : null;
  const { data: location = [], isLoading: locationLoading } = useLocationLap({
    session_key: sessionKey,
    driver_number: outline?.dn ?? null,
    date_gte: outline?.lap?.date_start ?? null,
    date_lt: outlineDateLt,
  });

  const { chartData, telemetryDrivers, statusBySlot } = useMemo(() => {
    const driverMap = new Map(drivers.map((d) => [d.driver_number, d]));
    const slots = [
      { driverNumber: slotA, ...a },
      { driverNumber: slotB, ...b },
    ];

    const grids = [null, null];
    const meta = [];
    const status = [];

    slots.forEach((slot, i) => {
      if (!slot.driverNumber) {
        status.push("empty");
        return;
      }
      const d = driverMap.get(slot.driverNumber);
      const base = {
        driver_number: slot.driverNumber,
        name: d?.full_name ?? `#${slot.driverNumber}`,
        team_name: d?.team_name ?? "",
        headshot_url: d?.headshot_url ?? null,
        team_colour: d?.team_colour ?? null,
        slot: i,
        suffix: i === 0 ? "a" : "b",
        lap_number: slot.lap?.lap_number ?? null,
        lapTime: slot.lap?.lap_duration ?? null,
        sectors: {
          s1: slot.lap?.duration_sector_1 ?? null,
          s2: slot.lap?.duration_sector_2 ?? null,
          s3: slot.lap?.duration_sector_3 ?? null,
        },
        topSpeed: null,
      };
      if (!slot.lap) {
        status.push("no-lap");
        meta.push({ ...base, status: "no-lap" });
        return;
      }
      if (!slot.samples.length) {
        status.push("no-telemetry");
        meta.push({ ...base, status: "no-telemetry" });
        return;
      }
      grids[i] = resampleToGrid(
        deriveDistance(slot.samples),
        TELEMETRY_GRID_POINTS
      );
      status.push("ok");
      meta.push({
        ...base,
        topSpeed: Math.max(...slot.samples.map((s) => s.speed)),
        status: "ok",
      });
    });

    return {
      chartData:
        grids[0] || grids[1] ? mergeDrivers(grids[0], grids[1]) : [],
      telemetryDrivers: meta,
      statusBySlot: status,
    };
  }, [slotA, slotB, a, b, drivers]);

  const trackMap = useMemo(() => {
    if (!outline) return null;
    if (!location.length) return locationLoading ? null : { status: "no-data" };

    const points = resampleTrack(
      deriveTrackDistance(location),
      TELEMETRY_GRID_POINTS
    );
    if (points.length < 2) return { status: "no-data" };

    const okCount = statusBySlot.filter((s) => s === "ok").length;
    let mode = null;
    let faster = null;
    let speed = null;
    if (okCount >= 2) {
      mode = "dominance";
      faster = buildDominance(chartData, 24);
    } else if (okCount === 1) {
      mode = "speed";
      speed = buildSpeedShade(chartData, outline.suffix);
    }

    return { points, mode, faster, speed, outlineSlot: outline.slot, status: "ok" };
  }, [outline, location, locationLoading, chartData, statusBySlot]);

  return {
    chartData,
    drivers: telemetryDrivers,
    statusBySlot,
    lapNumbers,
    trackMap,
    isLoading: a.isLoading || b.isLoading,
  };
}

export {
  transformDrivers,
  useDrivers,
  useDriversByYear,
  useSessions,
  useMeetings,
  useLaps,
  useChampionshipDrivers,
  useChampionshipTeams,
  useSessionResult,
  useStartingGrid,
  usePit,
  useStints,
  useCarData,
  useCarDataLap,
  useLocationLap,
  useWeather,
  useRaceControl,
  useOvertakes,
  useTeamsByYear,
  useRaceCalendar,
  useMeetingDetail,
  useSessionDetail,
  useSeasonGrandPrix,
  useSeasonKpis,
  useTelemetryComparison,
};
