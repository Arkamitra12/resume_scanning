
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loginUser } from "../services/api";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, ShieldCheck } from "lucide-react";

function LoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isCandidate = role === "candidate";
  const roleTitle = isCandidate ? "Candidate" : "Recruiter";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      const token = data.access_token || data.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      const user = data.user || data;
      localStorage.setItem("user", JSON.stringify(user));

      const actualRole = String(
        user.role || user.user_role || ""
      ).toLowerCase();

      if (actualRole !== role) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError(`This account is not registered as a ${role}.`);
        return;
      }

      if (actualRole === "candidate") {
        navigate("/candidate/jobs");
      } else if (actualRole === "recruiter") {
        navigate("/recruiter");
      } else {
        setError("Unable to determine user role.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT BRANDING SECTION */}
      <div className="login-brand-panel">
        <button
          className="login-home-link"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          Back to home
        </button>

        <div className="login-brand-content">
          <div className="login-brand-icon">
            <BriefcaseBusiness size={26} />
          </div>

          <h2 className="login-brand-name">TalentForge</h2>

          <div className="login-brand-line"></div>

          <h1>
            {isCandidate
              ? "Your next opportunity awaits."
              : "Discover talent. Build teams."}
          </h1>

          <p>
            {isCandidate
              ? "Step into a smarter job search. Explore opportunities that match your skills and ambitions."
              : "Make smarter hiring decisions with intelligent resume screening and streamlined recruitment."}
          </p>

          <div className="login-brand-feature">
            <ShieldCheck size={20} />
            <span>Intelligent recruitment. Better opportunities.</span>
          </div>
        </div>

        <div className="login-brand-footer">
          <span>AI-powered recruitment platform</span>
          <span>© TalentForge</span>
        </div>
      </div>

      {/* RIGHT LOGIN SECTION */}
      <div className="login-form-section">
        <div className="login-card">

          <div className="login-mobile-brand">
            <BriefcaseBusiness size={22} />
            <span>TalentForge</span>
          </div>

          <div className="login-heading">
            <span className="login-welcome-tag">
              {isCandidate ? "CANDIDATE PORTAL" : "RECRUITER PORTAL"}
            </span>

            <h2>Welcome back</h2>

            <p>
              Sign in to your {roleTitle.toLowerCase()} account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="login-input-group">
              <label htmlFor="login-email">Email address</label>

              <input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-input-group">
              <label htmlFor="login-password">Password</label>

              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="login-error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit-button"
              disabled={loading}
            >
              <span>{loading ? "Signing in..." : "Sign in"}</span>
              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          <div className="login-register-text">
            <span>Don't have an account?</span>

            <button
              onClick={() => navigate(`/${role}/register`)}
            >
              Create account
            </button>
          </div>

          <div className="login-security-note">
            <ShieldCheck size={15} />
            <span>Your account information is securely handled.</span>
          </div>

        </div>
      </div>

    </div>
  );
}

export default LoginPage;
