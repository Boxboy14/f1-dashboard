import "./App.css";
import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./components/dashboard/HomePage.jsx";
import DashboardLayout from "./components/dashboard/layouts/DashboardLayout.jsx";
import GlobalLoadingOverlay from "./components/common/GlobalLoadingOverlay.jsx";
import AssistantLauncher from "./components/assistant/AssistantLauncher.jsx";

const OverviewPage = lazy(() => import("./components/dashboard/OverviewPage.jsx"));
const TeamsPage = lazy(() => import("./components/dashboard/TeamsPage.jsx"));
const SeasonsPage = lazy(() => import("./components/dashboard/SeasonsPage.jsx"));
const MeetingPage = lazy(() => import("./components/dashboard/MeetingPage.jsx"));
const SessionDetailPage = lazy(() => import("./components/dashboard/SessionDetailPage.jsx"));
const TelemetryPage = lazy(() => import("./components/dashboard/TelemetryPage.jsx"));
const HowToUsePage = lazy(() => import("./components/dashboard/HowToUsePage.jsx"));
const FeedbackPage = lazy(() => import("./components/dashboard/FeedbackPage.jsx"));

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
          <Route path="how-to-use" element={<HowToUsePage />} />
          <Route path="feedback" element={<FeedbackPage />} />
        </Route>
      </Routes>
      <GlobalLoadingOverlay />
      <AssistantLauncher />
    </>
  );
}

export default App;
