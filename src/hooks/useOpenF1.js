import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { openF1Api } from "../services/api/openf1.js";
import { COUNTRY_CODE_MAP } from "../constants/countryMap.js";

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
    const now = new Date();
    return [...rawSessions]
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
      .map((s) => {
        if (isCancelled) return { ...s, status: "Cancelled" };
        const start = s.date_start ? new Date(s.date_start) : null;
        const end = s.date_end ? new Date(s.date_end) : null;
        let status = "Unknown";
        if (start && end) {
          if (end < now) status = "Completed";
          else if (start <= now) status = "In Progress";
          else status = "Upcoming";
        } else if (start) {
          status = start < now ? "Completed" : "Upcoming";
        }
        return { ...s, status };
      });
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

export {
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
  useWeather,
  useRaceControl,
  useOvertakes,
  useTeamsByYear,
  useRaceCalendar,
  useMeetingDetail,
  useSessionDetail,
};
