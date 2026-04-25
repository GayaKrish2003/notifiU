import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Standard Page Imports
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import EditProfilePage from "./pages/EditProfilePage";
import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import JobProviderDashboard from "./pages/JobProviderDashboard";
import ClubPresidentDashboard from "./pages/ClubPresidentDashboard";
import GlobalNotifications from "./components/GlobalNotifications";

// Module Management Pages
import ModuleDashboard from "./pages/ModuleDashboard";
import CreateModule from "./pages/CreateModule";
import AssignLecturer from "./pages/AssignLecturer";
import EditModule from "./pages/EditModule";
import EnrollmentManagement from "./pages/EnrollmentManagement";
import ReportsPage from "./pages/ReportsPage";
import LecturerModules from "./pages/LecturerModules";
import LecturerModuleView from "./pages/LecturerModuleView";
import LecturerEnrollments from "./pages/LecturerEnrollments";
import StudentModules from "./pages/StudentModules";
import MyModules from "./pages/MyModules";

import "./App.css";
import "./styles/admin.css";

const App: React.FC = () => {
  return (
    <Router>
      <GlobalNotifications />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/edit-profile/:id" element={<EditProfilePage />} />

        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/admin-dashboard" element={<SuperAdminDashboard />} />
        <Route
          path="/jobprovider-dashboard"
          element={<JobProviderDashboard />}
        />
        <Route
          path="/clubpresident-dashboard"
          element={<ClubPresidentDashboard />}
        />

        <Route path="/modules" element={<ModuleDashboard />} />
        <Route path="/create-module" element={<CreateModule />} />
        <Route path="/assign-lecturer" element={<AssignLecturer />} />
        <Route path="/edit-module/:id" element={<EditModule />} />
        <Route path="/enrollments" element={<EnrollmentManagement />} />
        <Route path="/reports" element={<ReportsPage />} />

        <Route path="/lecturer" element={<LecturerModules />} />
        <Route path="/lecturer/module/:id" element={<LecturerModuleView />} />
        <Route path="/lecturer-enrollments" element={<LecturerEnrollments />} />

        <Route path="/student-modules" element={<StudentModules />} />
        <Route path="/my-modules/:id" element={<MyModules />} />
      </Routes>
    </Router>
  );
};

export default App;
