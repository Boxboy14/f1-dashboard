import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, CircularProgress, Text } from "@salt-ds/core";
import { useMeetingDetail } from "../../hooks/useOpenF1.js";
import SessionsGrid from "../tabs/sessions/SessionsGrid.jsx";
import styles from "./MeetingPage.module.scss";

const MeetingPage = () => {
  const { meetingKey } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { meeting, sessions, isLoading } = useMeetingDetail(meetingKey);

  const goBackToCalendar = useCallback(() => {
    navigate({ pathname: "/seasons", search: searchParams.toString() });
  }, [navigate, searchParams]);

  const openSessionDetail = useCallback(
    (session) => {
      navigate({
        pathname: `/sessions/${session.session_key}`,
        search: searchParams.toString(),
      });
    },
    [navigate, searchParams]
  );

  if (isLoading && !meeting) {
    return <CircularProgress aria-label="Loading meeting" />;
  }

  if (!isLoading && !meeting) {
    return <Text>Meeting not found</Text>;
  }

  return (
    <>
      <Button variant="secondary" onClick={goBackToCalendar}>
        ← Back to Calendar
      </Button>
      <Text styleAs="h1">
        {meeting.year} {meeting.meeting_name}
      </Text>
      <div className={styles.countryRow}>
        {meeting.country_flag && (
          <img src={meeting.country_flag} alt="" className={styles.countryFlag} />
        )}
        <Text>{meeting.country_name}</Text>
      </div>
      <SessionsGrid
        sessions={sessions}
        isLoading={isLoading}
        onSessionOpen={openSessionDetail}
      />
    </>
  );
};

export default MeetingPage;
