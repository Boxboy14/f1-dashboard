import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CircularProgress, Text } from "@salt-ds/core";
import { useMeetingDetail } from "../../hooks/useOpenF1.js";
import SessionsGrid from "../tabs/sessions/SessionsGrid.jsx";

const MeetingPage = () => {
  const { meetingKey } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { meeting, sessions, isLoading } = useMeetingDetail(meetingKey);

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
      <Text styleAs="h2">{meeting.meeting_name}</Text>
      <Text>{meeting.country_name}</Text>
      <SessionsGrid
        sessions={sessions}
        isLoading={isLoading}
        onSessionOpen={openSessionDetail}
      />
    </>
  );
};

export default MeetingPage;
