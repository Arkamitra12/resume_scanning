import { useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";
import { Building2 } from "lucide-react";
function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-logo">✦ TalentForge</div>

        <h1>Welcome to TalentForge</h1>

        <p className="landing-subtitle">
          AI-Powered Recruitment Screening Platform
        </p>

        <p className="landing-description">
          Connecting talented candidates with opportunities
          and helping recruiters make smarter hiring decisions.
        </p>

        <div className="role-selection">
          <div className="role-card">
            <div className="role-icon">
            <UserRound size={34} strokeWidth={1.8} />
          </div>
            <h2>Candidate</h2>
            <p>
              Explore job opportunities, discover your career path,
              and apply for positions.
            </p>

            <button onClick={() => navigate("/candidate/login")}>
              Continue as Candidate →
            </button>
          </div>

          <div className="role-card">
           <div className="role-icon">
  <Building2 size={34} strokeWidth={1.8} />
</div>
            <h2>Recruiter</h2>
            <p>
              Manage job openings, review applications,
              and streamline your hiring process.
            </p>

            <button onClick={() => navigate("/recruiter/login")}>
              Continue as Recruiter →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;