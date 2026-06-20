import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { openF1Api } from "../services/api/openf1.js";
import { useSessions, useMeetings, useDrivers } from "./useOpenF1.js";
import { teamColor } from "../components/tabs/teams/standings/standingsColors.js";
import { createTeamSlug } from "../store/teams/utils.js";

const RACE_STALE = 10 * 60 * 1000;

// Assembles a season's championship evolution for the Teams-page charts:
// the ordered race rounds (sprints excluded), each team's colour (resolved
// via /drivers since /championship_teams has no colour field), and per-round
// points/position series. Per-round standings are fetched once via useQueries
// (keyed like useChampionshipTeams, so they dedupe + persist via the app's
// cache layer); only completed rounds fire.
export function useTeamStandingsEvolution(year) {
  const { data: sessions = [] } = useSessions({ year, session_type: "Race" });
  const { data: meetings = [] } = useMeetings({ year });

  const rounds = useMemo(() => {
    const byMeeting = new Map(
      meetings.map((m) => [
        m.meeting_key,
        { countryName: m.country_name, countryFlag: m.country_flag },
      ]),
    );
    const now = Date.now();
    return sessions
      .filter((s) => s.session_name === "Race") // races only — exclude sprints
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
      .map((s, i) => ({
        round: i + 1,
        sessionKey: s.session_key,
        meetingKey: s.meeting_key,
        countryName: byMeeting.get(s.meeting_key)?.countryName ?? "",
        countryFlag: byMeeting.get(s.meeting_key)?.countryFlag ?? null,
        completed: new Date(s.date_start).getTime() < now,
      }));
  }, [sessions, meetings]);

  const completedRounds = useMemo(
    () => rounds.filter((r) => r.completed),
    [rounds],
  );

  const standingsQueries = useQueries({
    queries: completedRounds.map((r) => ({
      queryKey: ["championship_teams", { session_key: r.sessionKey }],
      queryFn: () => openF1Api.championshipTeams({ session_key: r.sessionKey }),
      staleTime: RACE_STALE,
    })),
  });

  // Team colour (championship_teams has no colour field). Union the first and
  // last completed rounds' driver rosters so a team that fielded a mid-season
  // driver swap still resolves a colour — last round wins for shared team names.
  const firstCompletedKey = completedRounds[0]?.sessionKey ?? null;
  const lastCompletedKey = completedRounds.at(-1)?.sessionKey ?? null;
  const { data: firstDrivers = [] } = useDrivers(
    { session_key: firstCompletedKey },
    { enabled: Boolean(firstCompletedKey) },
  );
  const { data: lastDrivers = [] } = useDrivers(
    { session_key: lastCompletedKey },
    { enabled: Boolean(lastCompletedKey) },
  );
  const colorByTeamName = useMemo(() => {
    const byName = new Map();
    for (const d of firstDrivers) byName.set(d.team_name, d.team_colour);
    for (const d of lastDrivers) byName.set(d.team_name, d.team_colour);
    return byName;
  }, [firstDrivers, lastDrivers]);

  const isLoading =
    completedRounds.length > 0 && standingsQueries.some((q) => q.isLoading);

  // Stable primitive dep: changes whenever any round's data lands/refreshes,
  // without a variable-length deps array when the season changes.
  const dataSig = standingsQueries.map((q) => q.dataUpdatedAt).join("|");

  return useMemo(() => {
    if (completedRounds.length === 0) {
      return {
        rounds: [],
        teams: [],
        pointsData: [],
        rankData: [],
        teamCount: 0,
        isLoading,
        isEmpty: true,
      };
    }

    const perRound = completedRounds.map((r, i) => ({
      round: r,
      standings: standingsQueries[i]?.data ?? [],
    }));

    const teamNames = new Set(colorByTeamName.keys());
    for (const { standings } of perRound) {
      for (const row of standings) teamNames.add(row.team_name);
    }

    const lastStandings = perRound.at(-1)?.standings ?? [];
    const lastPos = new Map(
      lastStandings.map((row) => [row.team_name, row.position_current]),
    );

    const teams = [...teamNames]
      .map((teamName) => ({
        teamName,
        key: createTeamSlug({ team_name: teamName }),
        color: teamColor(colorByTeamName.get(teamName)),
      }))
      .sort(
        (a, b) =>
          (lastPos.get(a.teamName) ?? 99) - (lastPos.get(b.teamName) ?? 99),
      );

    const teamCount = Math.max(
      0,
      ...perRound.flatMap(({ standings }) =>
        standings.map((row) => row.position_current ?? 0),
      ),
    );

    const buildRows = (field) =>
      perRound.map(({ round, standings }) => {
        const byName = new Map(standings.map((row) => [row.team_name, row]));
        const row = {
          round: round.round,
          countryName: round.countryName,
          countryFlag: round.countryFlag,
        };
        for (const t of teams) {
          row[`t_${t.key}`] = byName.has(t.teamName)
            ? byName.get(t.teamName)[field]
            : null;
        }
        return row;
      });

    return {
      rounds: completedRounds,
      teams,
      pointsData: buildRows("points_current"),
      rankData: buildRows("position_current"),
      teamCount,
      isLoading,
      isEmpty: false,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedRounds, colorByTeamName, dataSig, isLoading]);
}
