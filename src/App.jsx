import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./components/dashboard/HomePage.jsx";
import TeamsPage from "./components/dashboard/TeamsPage.jsx";
import SeasonsPage from "./components/dashboard/SeasonsPage.jsx";
import MeetingPage from "./components/dashboard/MeetingPage.jsx";
import SessionDetailPage from "./components/dashboard/SessionDetailPage.jsx";
import OverviewPage from "./components/dashboard/OverviewPage.jsx";
import TelemetryPage from "./components/dashboard/TelemetryPage.jsx";
import DashboardLayout from "./components/dashboard/layouts/DashboardLayout.jsx";
import GlobalLoadingOverlay from "./components/common/GlobalLoadingOverlay.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/drivers" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="drivers" element={<HomePage />} />
          <Route path="drivers/:driverSlug" element={<HomePage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="teams/:teamSlug" element={<TeamsPage />} />
          <Route path="seasons" element={<SeasonsPage />} />
          <Route path="meetings/:meetingKey" element={<MeetingPage />} />
          <Route path="sessions/:sessionKey" element={<SessionDetailPage />} />
          <Route path="telemetry" element={<TelemetryPage />} />
        </Route>
      </Routes>
      <GlobalLoadingOverlay />
    </>
  );
}

export default App;
