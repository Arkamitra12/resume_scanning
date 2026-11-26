
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import LandingPage from "./pages/landingpage";
import LoginPage from "./pages/loginpage";
import RegisterPage from "./pages/registerpage";

// Recruiter components and pages
import RecruiterLayout from "./components/recruiter/RecruiterLayout";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import JobsPage from "./pages/recruiter/JobsPage";
import ApplicationPage from "./pages/recruiter/ApplicationPage";
import ApplicationDetails from "./pages/recruiter/ApplicationDetails";

// Candidate components and pages
import CandidateLayout from "./components/candidate/CandidateLayout";
import CandidateJobsPage from "./pages/candidate/CandidateJobsPage";
import JobDetailsPage from "./pages/candidate/JobDetailsPage";
import ApplyPage from "./pages/candidate/ApplyPage";
import MyApplicationsPage from "./pages/candidate/MyApplicationsPage";
import CandidateProfilePage from "./pages/candidate/CandidateProfilePage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Login and Registration */}
        <Route path="/:role/login" element={<LoginPage />} />
        <Route path="/:role/register" element={<RegisterPage />} />

        {/* Recruiter Portal */}
        <Route path="/recruiter" element={<RecruiterLayout />}>
          <Route index element={<RecruiterDashboard />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="applications" element={<ApplicationPage />} />
          <Route path="applications/:id" element={<ApplicationDetails />} />
        </Route>

        {/* Candidate Portal */}
        <Route path="/candidate" element={<CandidateLayout />}>
  <Route path="jobs" element={<CandidateJobsPage />} />
  <Route path="jobs/:id" element={<JobDetailsPage />} />
  <Route path="apply/:jobId" element={<ApplyPage />} />
  <Route path="applications" element={<MyApplicationsPage />} />
   <Route path="profile" element={<CandidateProfilePage />} />
</Route>

        {/* Unknown Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
