const BASE_URL = "https://api.openf1.org/v1";

function buildUrl(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
}

async function fetchOpenF1(endpoint, params = {}) {
  const url = buildUrl(endpoint, params);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenF1 API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export const openF1Api = {
  drivers: (params) => fetchOpenF1("/drivers", params),
  sessions: (params) => fetchOpenF1("/sessions", params),
  meetings: (params) => fetchOpenF1("/meetings", params),
  laps: (params) => fetchOpenF1("/laps", params),
  championshipDrivers: (params) => fetchOpenF1("/championship_drivers", params),
  championshipTeams: (params) => fetchOpenF1("/championship_teams", params),
  sessionResult: (params) => fetchOpenF1("/session_result", params),
  startingGrid: (params) => fetchOpenF1("/starting_grid", params),
  pit: (params) => fetchOpenF1("/pit", params),
  stints: (params) => fetchOpenF1("/stints", params),
  intervals: (params) => fetchOpenF1("/intervals", params),
  position: (params) => fetchOpenF1("/position", params),
  carData: (params) => fetchOpenF1("/car_data", params),
  location: (params) => fetchOpenF1("/location", params),
  raceControl: (params) => fetchOpenF1("/race_control", params),
  teamRadio: (params) => fetchOpenF1("/team_radio", params),
  weather: (params) => fetchOpenF1("/weather", params),
  overtakes: (params) => fetchOpenF1("/overtakes", params),
};
