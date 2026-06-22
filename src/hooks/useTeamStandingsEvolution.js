import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { openF1Api } from "../services/api/openf1.js";
import { useSessions, useMeetings, useDrivers } from "./useOpenF1.js";
import { teamColor } from "../components/tabs/teams/standings/standingsColors.js";
import { createTeamSlug } from "../store/teams/utils.js";

const RACE_STALE = 10 * 60 * 1000;

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
      .filter((s) => s.session_name === "Race")
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

  const sessionKeys = useMemo(
    () => completedRounds.map((r) => r.sessionKey),
    [completedRounds],
  );

  const { data: standingsRows = [], isLoading: isLoadingStandings } = useQuery({
    queryKey: ["championship_teams_evolution", { session_keys: sessionKeys }],
    queryFn: () => openF1Api.championshipTeams({ session_key: sessionKeys }),
    staleTime: RACE_STALE,
    enabled: sessionKeys.length > 0,
  });

  const standingsBySession = useMemo(() => {
    const map = new Map();
    for (const row of standingsRows) {
      const list = map.get(row.session_key) ?? [];
      list.push(row);
      map.set(row.session_key, list);
    }
    return map;
  }, [standingsRows]);

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

  const isLoading = completedRounds.length > 0 && isLoadingStandings;

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

    const perRound = completedRounds.map((r) => ({
      round: r,
      standings: standingsBySession.get(r.sessionKey) ?? [],
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
  }, [completedRounds, colorByTeamName, standingsBySession, isLoading]);
}
