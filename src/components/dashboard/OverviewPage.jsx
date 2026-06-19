import { useCallback, useMemo } from "react";
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
import { CircularProgress, Text } from "@salt-ds/core";
import {
  useSeasonGrandPrix,
  useSeasonKpis,
  useDriversByYear,
} from "../../hooks/useOpenF1.js";
import SeasonKpiStrip from "../tabs/overview/SeasonKpiStrip.jsx";
import GrandPrixCardGrid from "../tabs/overview/GrandPrixCardGrid.jsx";

const OverviewPage = () => {
  const { year } = useOutletContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { grandPrix, isLoading } = useSeasonGrandPrix(year);
  const { kpis, isLoading: kpisLoading } = useSeasonKpis(year);
  const { data: drivers = [] } = useDriversByYear(year);

  const driversByNumber = useMemo(
    () => new Map(drivers.map((d) => [d.driver_number, d])),
    [drivers],
  );

  const onOpenMeeting = useCallback(
    (meetingKey) =>
      navigate({
        pathname: `/meetings/${meetingKey}`,
        search: searchParams.toString(),
      }),
    [navigate, searchParams],
  );

  return (
    <>
      <Text styleAs="h1">{year} Season Overview</Text>
      <SeasonKpiStrip kpis={kpis} isLoading={kpisLoading} />
      {isLoading && !grandPrix.length ? (
        <CircularProgress aria-label="Loading season" />
      ) : !grandPrix.length ? (
        <Text>No Grand Prix data for this season</Text>
      ) : (
        <GrandPrixCardGrid
          grandPrix={grandPrix}
          driversByNumber={driversByNumber}
          onOpenMeeting={onOpenMeeting}
        />
      )}
    </>
  );
};

export default OverviewPage;
