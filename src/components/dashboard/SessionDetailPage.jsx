import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, CircularProgress, Text } from "@salt-ds/core";
import { useSessionDetail } from "../../hooks/useOpenF1.js";
import ClassificationGrid from "../tabs/session-detail/ClassificationGrid.jsx";
import PitStopsGrid from "../tabs/session-detail/PitStopsGrid.jsx";
import styles from "./SessionDetailPage.module.scss";

const formatSessionDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const SessionDetailPage = () => {
  const { sessionKey } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, results, pitStops, isLoading } =
    useSessionDetail(sessionKey);

  const goBack = useCallback(() => {
    if (session) {
      navigate({
        pathname: `/meetings/${session.meeting_key}`,
        search: searchParams.toString(),
      });
    }
  }, [navigate, session, searchParams]);

  const isSessionTypeRace = ["Race", "Sprint"].includes(session?.session_type);
  const isSessionTypeQualifying = session?.session_type === "Qualifying";

  if (isLoading && !session)
    return <CircularProgress aria-label="Loading session" />;
  if (!isLoading && !session) return <Text>Session not found</Text>;

  return (
    <>
      <Button variant="secondary" onClick={goBack}>
        ← Back to Meeting
      </Button>
      <Text styleAs="h2">{session.session_name} Results</Text>
      <Text>{formatSessionDate(session.date_start)}</Text>
      {isSessionTypeQualifying && (
        <Text className={styles.startingGridLabel}>Starting Grid</Text>
      )}
      <ClassificationGrid
        results={results}
        sessionType={session.session_type}
        isLoading={isLoading}
      />
      {isSessionTypeRace && (pitStops.length > 0 || isLoading) && (
        <>
          <Text styleAs="h3" className={styles.heading}>
            Pit Stops
          </Text>
          <PitStopsGrid pitStops={pitStops} isLoading={isLoading} />
        </>
      )}
    </>
  );
};

export default SessionDetailPage;
