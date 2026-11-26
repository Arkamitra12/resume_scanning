import { NavLink, useNavigate } from "react-router-dom";

function CandidateNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <header className="candidate-navbar">
      <div className="candidate-brand">
        <span className="brand-icon">✦</span>
        <div>
          <h2>TalentForge</h2>
          <p>Career Portal</p>
        </div>
      </div>

      <nav className="candidate-navigation">
        <NavLink to="/candidate/jobs" className="candidate-link">
          Browse Jobs
        </NavLink>

        <NavLink to="/candidate/applications" className="candidate-link">
          My Applications
        </NavLink>

        <NavLink to="/candidate/profile" className="candidate-link">
          My Profile
        </NavLink>

        <button className="candidate-logout-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}

export default CandidateNavbar;