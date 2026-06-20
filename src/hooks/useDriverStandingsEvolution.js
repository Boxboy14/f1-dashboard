import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { openF1Api } from "../services/api/openf1.js";
import { useSessions, useMeetings, useDrivers } from "./useOpenF1.js";
import { driverColor } from "../components/tabs/drivers/standings/standingsColors.js";

const RACE_STALE = 10 * 60 * 1000;

// Assembles a season's championship evolution for the Drivers-tab charts:
// the ordered race rounds (sprints excluded), each driver's team-coloured
// identity, and per-round points/position series. Per-round standings are
// fetched once via useQueries (keyed like useChampionshipDrivers, so they
// dedupe + persist via the app's cache layer); only completed rounds fire.
export function useDriverStandingsEvolution(year) {
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
      queryKey: ["championship_drivers", { session_key: r.sessionKey }],
      queryFn: () => openF1Api.championshipDrivers({ session_key: r.sessionKey }),
      staleTime: RACE_STALE,
    })),
  });

  // Driver identity (name, 3-letter code, team colour). Union the first and last
  // completed rounds' rosters so a driver who left mid-season (e.g. Sargeant,
  // de Vries, Doohan) keeps their real name/code/colour instead of falling back
  // to a number — the last round alone omits them. Last round wins for shared
  // numbers so the current roster's team colour is used.
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
  const driverList = useMemo(() => {
    const byNumber = new Map();
    for (const d of firstDrivers) byNumber.set(d.driver_number, d);
    for (const d of lastDrivers) byNumber.set(d.driver_number, d);
    return [...byNumber.values()];
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
        drivers: [],
        pointsData: [],
        rankData: [],
        driverCount: 0,
        isLoading,
        isEmpty: true,
      };
    }

    const perRound = completedRounds.map((r, i) => ({
      round: r,
      standings: standingsQueries[i]?.data ?? [],
    }));

    const meta = new Map(
      driverList.map((d) => [
        d.driver_number,
        {
          driverNumber: d.driver_number,
          name: d.full_name,
          code: d.name_acronym ?? String(d.driver_number),
          color: driverColor(d.team_colour),
        },
      ]),
    );

    const driverNumbers = new Set(meta.keys());
    for (const { standings } of perRound) {
      for (const row of standings) driverNumbers.add(row.driver_number);
    }

    const lastStandings = perRound.at(-1)?.standings ?? [];
    const lastPos = new Map(
      lastStandings.map((row) => [row.driver_number, row.position_current]),
    );

    const drivers = [...driverNumbers]
      .map(
        (dn) =>
          meta.get(dn) ?? {
            driverNumber: dn,
            name: `#${dn}`,
            code: String(dn),
            color: driverColor(null),
          },
      )
      .sort(
        (a, b) =>
          (lastPos.get(a.driverNumber) ?? 99) -
          (lastPos.get(b.driverNumber) ?? 99),
      );

    const driverCount = Math.max(
      0,
      ...perRound.flatMap(({ standings }) =>
        standings.map((row) => row.position_current ?? 0),
      ),
    );

    const buildRows = (field) =>
      perRound.map(({ round, standings }) => {
        const byDn = new Map(standings.map((row) => [row.driver_number, row]));
        const row = {
          round: round.round,
          countryName: round.countryName,
          countryFlag: round.countryFlag,
        };
        for (const dn of driverNumbers) {
          row[`d${dn}`] = byDn.has(dn) ? byDn.get(dn)[field] : null;
        }
        return row;
      });

    return {
      rounds: completedRounds,
      drivers,
      pointsData: buildRows("points_current"),
      rankData: buildRows("position_current"),
      driverCount,
      isLoading,
      isEmpty: false,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedRounds, driverList, dataSig, isLoading]);
}
