import { useCallback } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { Text } from "@salt-ds/core";
import CalendarGrid from "../tabs/calendar/CalendarGrid.jsx";

const SeasonsPage = () => {
  const { year } = useOutletContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const openRaceDetail = useCallback(
    (meeting) => {
      navigate({
        pathname: `/meetings/${meeting.meeting_key}`,
        search: searchParams.toString(),
      });
    },
    [navigate, searchParams]
  );

  return (
    <>
      <Text styleAs="h2">Calendar</Text>
      <CalendarGrid year={year} onRaceOpen={openRaceDetail} />
    </>
  );
};

export default SeasonsPage;
