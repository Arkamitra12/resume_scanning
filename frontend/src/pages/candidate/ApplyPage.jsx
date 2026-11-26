
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { submitApplication } from "../../services/api";
import { Upload, FileText, ArrowLeft, ArrowRight, CheckCircle, X, BriefcaseBusiness } from "lucide-react";

function ApplyPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!resume) {
      setError("Please upload your resume.");
      return;
    }

    setLoading(true);

    try {
      await submitApplication(jobId, resume);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Application submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF resume.");
      e.target.value = "";
      setResume(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Resume size must be less than 5 MB.");
      e.target.value = "";
      setResume(null);
      return;
    }

    setError("");
    setResume(file);
  };

  if (submitted) {
    return (
      <div className="tf-apply-page">
        <div className="tf-apply-card tf-apply-success">
          <div className="tf-apply-brand">
            <div className="tf-apply-brand-icon">
              <BriefcaseBusiness size={22} />
            </div>
            <div>
              <h3>TalentForge</h3>
              <span>Career Portal</span>
            </div>
          </div>

          <div className="tf-success-icon">
            <CheckCircle size={42} />
          </div>

          <h1>Application Submitted!</h1>

          <p className="tf-apply-subtitle">
            Your application has been successfully submitted.
            Your profile is now ready for review.
          </p>

          <div className="tf-success-file">
            <FileText size={21} />
            <div>
              <strong>{resume?.name || "Resume submitted"}</strong>
              <span>Successfully submitted</span>
            </div>
            <CheckCircle size={20} className="tf-file-success" />
          </div>

          <button
            className="tf-apply-primary"
            onClick={() => navigate("/candidate/jobs")}
          >
            Browse More Jobs <ArrowRight size={18} />
          </button>

          <button
            className="tf-apply-secondary"
            onClick={() => navigate("/candidate/applications")}
          >
            View My Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tf-apply-page">
      <div className="tf-apply-container">

        <button
          className="tf-apply-back"
          onClick={() => navigate(`/candidate/jobs/${jobId}`)}
        >
          <ArrowLeft size={17} />
          Back to Job Details
        </button>

        <div className="tf-apply-card">

          <div className="tf-apply-brand">
            <div className="tf-apply-brand-icon">
              <BriefcaseBusiness size={22} />
            </div>

            <div>
              <h3>TalentForge</h3>
              <span>Career Portal</span>
            </div>
          </div>

          <div className="tf-apply-heading">
            <div className="tf-apply-heading-icon">
              <FileText size={25} />
            </div>

            <div>
              <h1>Submit Your Application</h1>
              <p>Take the next step towards your career.</p>
            </div>
          </div>

          <div className="tf-apply-progress">
            <div className="tf-progress-step active">
              <span>1</span>
              <p>Resume Upload</p>
            </div>

            <div className="tf-progress-line"></div>

            <div className="tf-progress-step">
              <span>2</span>
              <p>Submission</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="tf-apply-input-group">
              <label>Upload Your Resume</label>
              <p className="tf-upload-description">
                Upload your resume so the recruiter can review your qualifications.
              </p>

              <label className={`tf-resume-upload ${resume ? "has-file" : ""}`}>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleResumeChange}
                  required={!resume}
                />

                {resume ? (
                  <>
                    <div className="tf-upload-icon tf-upload-success-icon">
                      <FileText size={30} />
                    </div>

                    <div className="tf-upload-text">
                      <strong>Resume selected</strong>
                      <span>{resume.name}</span>
                    </div>

                    <button
                      type="button"
                      className="tf-remove-file"
                      onClick={(e) => {
                        e.preventDefault();
                        setResume(null);
                        setError("");
                      }}
                      title="Remove file"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="tf-upload-icon">
                      <Upload size={30} />
                    </div>

                    <div className="tf-upload-text">
                      <strong>Click to upload your resume</strong>
                      <span>PDF files only</span>
                    </div>

                    <span className="tf-upload-browse">
                      Browse Files
                    </span>
                  </>
                )}
              </label>

              <div className="tf-upload-limits">
                <span><CheckCircle size={15} /> PDF format</span>
                <span>Maximum size: 5 MB</span>
              </div>
            </div>

            {error && (
              <div className="tf-apply-error">
                <span>!</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="tf-apply-primary"
              disabled={loading}
            >
              {loading ? (
                "Submitting Application..."
              ) : (
                <>
                  Submit Application <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              className="tf-apply-secondary"
              onClick={() => navigate(`/candidate/jobs/${jobId}`)}
            >
              Cancel
            </button>

          </form>

          <div className="tf-apply-privacy">
            <CheckCircle size={16} />
            <p>Your resume will be securely submitted for this job application.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ApplyPage;
