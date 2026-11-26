
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { registerCandidate } from "../services/api";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
  UserRoundPlus,
} from "lucide-react";

function RegisterPage() {
  const { role } = useParams();
  const navigate = useNavigate();

  const isCandidate = role === "candidate";
  const roleTitle = isCandidate ? "Candidate" : "Recruiter";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match. Please try again.");
      return;
    }

    if (!isCandidate) {
      setError("Recruiter registration is not currently available.");
      return;
    }

    setLoading(true);

    try {
      await registerCandidate({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setRegistered(true);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    if (error) setError("");
  };

  return (
    <div className="register-page">

      {/* LEFT BRANDING PANEL */}
      <div className="register-brand-panel">

        <button
          className="register-home-link"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          Back to home
        </button>

        <div className="register-brand-content">

          <div className="register-brand-icon">
            <UserRoundPlus size={26} />
          </div>

          <h2 className="register-brand-name">TalentForge</h2>

          <div className="register-brand-line"></div>

          <h1>
            {isCandidate
              ? "Your journey starts with one step."
              : "Build your hiring network."}
          </h1>

          <p>
            {isCandidate
              ? "Create your account, discover opportunities and let your skills open new doors."
              : "Connect with skilled professionals and simplify your recruitment journey."}
          </p>

          <div className="register-brand-feature">
            <ShieldCheck size={20} />
            <span>Smarter connections. Stronger careers.</span>
          </div>

        </div>

        <div className="register-brand-footer">
          <span>AI-powered recruitment platform</span>
          <span>© TalentForge</span>
        </div>

      </div>

      {/* RIGHT REGISTRATION PANEL */}
      <div className="register-form-section">

        <div className="register-card">

          <div className="register-mobile-brand">
            <BriefcaseBusiness size={22} />
            <span>TalentForge</span>
          </div>

          {registered ? (

            /* SUCCESS SCREEN */
            <div className="register-success-content">

              <div className="register-success-icon">
                <ShieldCheck size={32} />
              </div>

              <span className="register-welcome-tag">
                ACCOUNT CREATED
              </span>

              <h2>Registration successful!</h2>

              <p>
                Your {roleTitle.toLowerCase()} registration has been
                completed successfully. You can now sign in to
                continue.
              </p>

              <button
                className="register-submit-button"
                onClick={() => navigate(`/${role}/login`)}
              >
                <span>Go to Login</span>
                <ArrowRight size={18} />
              </button>

              <button
                className="register-back-button"
                onClick={() => navigate("/")}
              >
                <ArrowLeft size={17} />
                Back to Home
              </button>

            </div>

          ) : (

            /* REGISTRATION FORM */
            <>
              <div className="register-heading">

                <span className="register-welcome-tag">
                  {isCandidate
                    ? "CANDIDATE REGISTRATION"
                    : "RECRUITER REGISTRATION"}
                </span>

                <h2>Create your account</h2>

                <p>
                  Get started with your {roleTitle.toLowerCase()}
                  {" "}account.
                </p>

              </div>

              <form onSubmit={handleSubmit}>

                <div className="register-input-group">
                  <label htmlFor="register-name">
                    Full name
                  </label>

                  <input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError();
                    }}
                    required
                  />
                </div>

                <div className="register-input-group">
                  <label htmlFor="register-email">
                    Email address
                  </label>

                  <input
                    id="register-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError();
                    }}
                    required
                  />
                </div>

                {!isCandidate && (
                  <div className="register-input-group">
                    <label htmlFor="register-company">
                      Company name
                    </label>

                    <input
                      id="register-company"
                      type="text"
                      placeholder="Enter your company name"
                      value={company}
                      onChange={(e) => {
                        setCompany(e.target.value);
                        clearError();
                      }}
                      required
                    />
                  </div>
                )}

                <div className="register-input-group">
                  <label htmlFor="register-password">
                    Password
                  </label>

                  <input
                    id="register-password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError();
                    }}
                    required
                    minLength={8}
                  />
                </div>

                <div className="register-input-group">
                  <label htmlFor="register-confirm-password">
                    Confirm password
                  </label>

                  <input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearError();
                    }}
                    required
                  />
                </div>

                {error && (
                  <div className="register-error-message">
                    <span className="register-error-icon">!</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="register-submit-button"
                  disabled={loading}
                >
                  <span>
                    {loading ? "Creating account..." : "Create account"}
                  </span>

                  {!loading && <ArrowRight size={18} />}
                </button>

              </form>

              <div className="register-login-text">
                <span>Already have an account?</span>

                <button
                  onClick={() => navigate(`/${role}/login`)}
                >
                  Sign in
                </button>
              </div>

              <div className="register-security-note">
                <ShieldCheck size={15} />
                <span>Your account information is securely handled.</span>
              </div>

            </>
          )}

        </div>

      </div>

    </div>
  );
}

export default RegisterPage;
