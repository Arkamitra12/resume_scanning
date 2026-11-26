
import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/api";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  UsersRound,
  LogOut,
  Sparkles,
} from "lucide-react";

function RecruiterSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <aside className="recruiter-sidebar">
      {/* BRAND */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Sparkles size={23} strokeWidth={2} />
        </div>

        <div className="brand-text">
          <h2>TalentForge</h2>
          <p>Recruiter Portal</p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="recruiter-navigation">
        <NavLink to="/recruiter" end className="sidebar-link">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/recruiter/jobs" className="sidebar-link">
          <BriefcaseBusiness size={20} />
          <span>Job Openings</span>
        </NavLink>

        <NavLink to="/recruiter/applications" className="sidebar-link">
          <UsersRound size={20} />
          <span>Applications</span>
        </NavLink>
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="profile-avatar">HR</div>

        <div className="sidebar-profile-text">
          <h4>Recruiter</h4>
          <p>Recruitment Team</p>
        </div>
      </div>

      {/* LOGOUT */}
      <button
        className="recruiter-logout-button"
        onClick={handleLogout}
      >
        <LogOut size={19} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default RecruiterSidebar;
