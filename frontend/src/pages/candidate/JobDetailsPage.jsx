
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getJobById } from "../../services/api";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  BriefcaseBusiness,
  Building2,
  Layers3,
  FileText,
} from "lucide-react";

function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await getJobById(id);
        setJob(data.job || data);
      } catch (err) {
        setError(err.message || "Unable to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="tf-details-page">
        <div className="tf-details-state">
          <div className="tf-details-spinner"></div>
          <h3>Loading job details</h3>
          <p>Please wait while we fetch the position details.</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="tf-details-page">
        <div className="tf-details-state">
          <h2>{error || "Job not found"}</h2>
          <button
            className="tf-details-back"
            onClick={() => navigate("/candidate/jobs")}
          >
            <ArrowLeft size={16} />
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const rawSkills = job.required_skills || job.skills || [];

  const skills = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === "string"
      ? rawSkills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const jobId = job.job_id || job.id;
  const jobType = job.type || job.employment_type || "Job";

  return (
    <div className="tf-details-page">

      {/* BACK */}
      <button
        className="tf-details-back"
        onClick={() => navigate("/candidate/jobs")}
      >
        <ArrowLeft size={17} />
        Back to Opportunities
      </button>

      {/* DETAILS CARD */}
      <article className="tf-details-card">

        {/* TOP HEADER */}
        <div className="tf-details-header">

          <div className="tf-details-title-block">

            <div className="tf-details-icon">
              <BriefcaseBusiness size={28} />
            </div>

            <div>
              <div className="tf-details-eyebrow">
                POSITION DETAILS
              </div>

              <h1>{job.title || "Untitled Position"}</h1>

              <p className="tf-details-department">
                {job.department || "General"}
              </p>
            </div>

          </div>

          <span className="tf-details-type">
            {jobType}
          </span>

        </div>

        {/* META */}
        <div className="tf-details-meta">

          <div className="tf-details-meta-item">
            <MapPin size={18} />
            <div>
              <span className="tf-meta-label">Location</span>
              <strong>{job.location || "Not specified"}</strong>
            </div>
          </div>

          <div className="tf-details-meta-item">
            <BriefcaseBusiness size={18} />
            <div>
              <span className="tf-meta-label">Employment type</span>
              <strong>{jobType}</strong>
            </div>
          </div>

          <div className="tf-details-meta-item">
            <Building2 size={18} />
            <div>
              <span className="tf-meta-label">Department</span>
              <strong>{job.department || "General"}</strong>
            </div>
          </div>

        </div>

        <div className="tf-details-divider"></div>

        {/* DESCRIPTION */}
        <section className="tf-details-section">

          <div className="tf-details-section-heading">
            <div className="tf-section-icon">
              <FileText size={19} />
            </div>
            <h2>About the Role</h2>
          </div>

          <p className="tf-details-description">
            {job.description || "No description available."}
          </p>

        </section>

        {/* SKILLS */}
        <section className="tf-details-section">

          <div className="tf-details-section-heading">
            <div className="tf-section-icon">
              <Layers3 size={19} />
            </div>
            <h2>Required Skills</h2>
          </div>

          {skills.length > 0 ? (

            <div className="tf-details-skills">

              {skills.map((skill, index) => (
                <span
                  className="tf-details-skill"
                  key={index}
                >
                  {skill}
                </span>
              ))}

            </div>

          ) : (

            <p className="tf-no-skills">
              No specific skills have been listed.
            </p>

          )}

        </section>

        {/* APPLY */}
        <div className="tf-details-apply-section">

          <div className="tf-details-apply-text">
            <h3>Interested in this opportunity?</h3>
            <p>
              Submit your application and take the next step in your career.
            </p>
          </div>

          <button
            className="tf-details-apply-button"
            onClick={() => navigate(`/candidate/apply/${jobId}`)}
          >
            Apply for this Position
            <ArrowRight size={18} />
          </button>

        </div>

      </article>

    </div>
  );
}

export default JobDetailsPage;
