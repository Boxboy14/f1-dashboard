import { useCallback } from "react";
import { useNavigate, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import { Text } from "@salt-ds/core";
import TeamsGrid from "../tabs/teams/TeamsGrid.jsx";
import TeamDetailCard from "../tabs/teams/TeamDetailCard.jsx";
import TeamStandingsCharts from "../tabs/teams/standings/TeamStandingsCharts.jsx";
import { useTeamsByYear } from "../../hooks/useOpenF1.js";
import { createTeamSlug } from "../../store/teams/utils.js";
import styles from "./TeamsPage.module.scss";

const TeamsPage = () => {
  const { year } = useOutletContext();
  const { teamSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: teams = [] } = useTeamsByYear(year);
  const selectedTeam = teams.find((t) => createTeamSlug(t) === teamSlug);

  const openTeamDetail = useCallback(
    (team) => {
      navigate({
        pathname: `/teams/${createTeamSlug(team)}`,
        search: searchParams.toString(),
      });
    },
    [navigate, searchParams]
  );

  const handleDetailClose = useCallback(
    (isOpen) => {
      if (!isOpen) {
        navigate({ pathname: "/teams", search: searchParams.toString() });
      }
    },
    [navigate, searchParams]
  );

  return (
    <>
      <Text styleAs="h1">Teams</Text>
      <div className={styles.layout}>
        <div className={styles.gridCol}>
          <TeamsGrid year={year} onTeamOpen={openTeamDetail} />
        </div>
        <div className={styles.chartsCol}>
          <TeamStandingsCharts year={year} />
        </div>
      </div>
      <TeamDetailCard
        isOpen={Boolean(teamSlug && selectedTeam)}
        teamData={selectedTeam}
        id={teamSlug ?? "team-detail"}
        setIsDetailOpen={handleDetailClose}
      />
    </>
  );
};

export default TeamsPage;
