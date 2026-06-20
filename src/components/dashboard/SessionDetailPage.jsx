import { useCallback, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogHeader,
  FlexLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
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
  const [pitStopsOpen, setPitStopsOpen] = useState(false);
  const { session, gpName, results, pitStops, isLoading } =
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
  const hasPitStops = isSessionTypeRace && pitStops.length > 0;

  if (isLoading && !session)
    return <CircularProgress aria-label="Loading session" />;
  if (!isLoading && !session) return <Text>Session not found</Text>;

  const resultsTitle = gpName
    ? `${session.year} ${gpName} - ${session.session_name} Results`
    : `${session.year} ${session.session_name} Results`;

  return (
    <>
      <Button variant="secondary" onClick={goBack}>
        ← Back to Meeting
      </Button>
      <Text styleAs="h1">{resultsTitle}</Text>
      <Text>{formatSessionDate(session.date_start)}</Text>
      {isSessionTypeQualifying && (
        <Text className={styles.startingGridLabel}>Starting Grid</Text>
      )}
      {hasPitStops && (
        <FlexLayout justify="end" className={styles.actionsRow}>
          <Button onClick={() => setPitStopsOpen(true)}>
            Click to view Pit Stops
          </Button>
        </FlexLayout>
      )}
      <ClassificationGrid
        results={results}
        sessionType={session.session_type}
        isLoading={isLoading}
      />
      {hasPitStops && (
        <Dialog
          open={pitStopsOpen}
          onOpenChange={setPitStopsOpen}
          size="large"
          className={styles.pitDialog}
        >
          <DialogHeader
            header={`${session.year} ${gpName} Pit Stops`}
            actions={
              <Button
                appearance="transparent"
                onClick={() => setPitStopsOpen(false)}
                aria-label="Close pit stops"
              >
                <CloseIcon aria-hidden />
              </Button>
            }
          />
          <DialogContent>
            <PitStopsGrid
              pitStops={pitStops}
              isLoading={isLoading}
              height="60vh"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default SessionDetailPage;
