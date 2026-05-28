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

export function useDrivers(params, options) {
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

export function useSessions(params, options) {
  return useQuery({
    queryKey: ["sessions", params],
    queryFn: () => openF1Api.sessions(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useMeetings(params, options) {
  return useQuery({
    queryKey: ["meetings", params],
    queryFn: () => openF1Api.meetings(params),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useLaps(params, options) {
  return useQuery({
    queryKey: ["laps", params],
    queryFn: () => openF1Api.laps(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key && params?.driver_number),
    ...options,
  });
}

export function useChampionshipDrivers(params, options) {
  return useQuery({
    queryKey: ["championship_drivers", params],
    queryFn: () => openF1Api.championshipDrivers(params),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useChampionshipTeams(params, options) {
  return useQuery({
    queryKey: ["championship_teams", params],
    queryFn: () => openF1Api.championshipTeams(params),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useSessionResult(params, options) {
  return useQuery({
    queryKey: ["session_result", params],
    queryFn: () => openF1Api.sessionResult(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key),
    ...options,
  });
}

export function useStartingGrid(params, options) {
  return useQuery({
    queryKey: ["starting_grid", params],
    queryFn: () => openF1Api.startingGrid(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key),
    ...options,
  });
}

export function usePit(params, options) {
  return useQuery({
    queryKey: ["pit", params],
    queryFn: () => openF1Api.pit(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key),
    ...options,
  });
}

export function useStints(params, options) {
  return useQuery({
    queryKey: ["stints", params],
    queryFn: () => openF1Api.stints(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key),
    ...options,
  });
}

export function useCarData(params, options) {
  return useQuery({
    queryKey: ["car_data", params],
    queryFn: () => openF1Api.carData(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key && params?.driver_number),
    ...options,
  });
}

export function useWeather(params, options) {
  return useQuery({
    queryKey: ["weather", params],
    queryFn: () => openF1Api.weather(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.meeting_key),
    ...options,
  });
}

export function useRaceControl(params, options) {
  return useQuery({
    queryKey: ["race_control", params],
    queryFn: () => openF1Api.raceControl(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key),
    ...options,
  });
}

export function useOvertakes(params, options) {
  return useQuery({
    queryKey: ["overtakes", params],
    queryFn: () => openF1Api.overtakes(params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(params?.session_key),
    ...options,
  });
}
