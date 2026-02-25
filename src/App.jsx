import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./components/dashboard/HomePage.jsx";
import DashboardLayout from "./components/dashboard/layouts/DashboardLayout.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/drivers" replace />} />
        <Route path="drivers" element={<HomePage />} />
      </Route>
    </Routes>
  );
}

export default App;
