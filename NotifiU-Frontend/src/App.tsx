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


import "./App.css";

// Define the component using the React.FC (Functional Component) type
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/edit-profile/:id" element={<EditProfilePage />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/admin-dashboard" element={<SuperAdminDashboard />} />
      </Routes>
      
    </Router>
  );
};


export default App;
