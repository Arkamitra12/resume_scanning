
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../../services/api";
import {
  Search,
  MapPin,
  BriefcaseBusiness,
  ArrowRight,
  Building2,
  Layers3,
} from "lucide-react";

function CandidateJobsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(Array.isArray(data) ? data : data.jobs || []);
      } catch (err) {
        setError(err.message || "Unable to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) =>
    `${job.title || ""} ${job.department || ""} ${job.location || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="tf-jobs-page">

      {/* PAGE INTRO */}
      <section className="tf-jobs-intro">

        <div className="tf-jobs-intro-label">
          <Layers3 size={16} />
          <span>CAREER OPPORTUNITIES</span>
        </div>

        <h1>
          Find your next <span>opportunity.</span>
        </h1>

        <p>
          Explore open positions and discover opportunities
          that align with your skills and ambitions.
        </p>

      </section>

      {/* SEARCH */}
      <div className="tf-jobs-search-wrapper">

        <div className="tf-jobs-search">

          <Search size={20} className="tf-search-icon" />

          <input
            type="text"
            placeholder="Search job title, department or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="tf-clear-search"
              onClick={() => setSearch("")}
              type="button"
            >
              Clear
            </button>
          )}

        </div>

      </div>

      {/* JOB LIST */}
      <section className="tf-jobs-list-section">

        <div className="tf-jobs-list-heading">

          <div>
            <h2>Open Positions</h2>
            <p>Explore the latest opportunities.</p>
          </div>

          <div className="tf-jobs-count">
            <span>{filteredJobs.length}</span>
            {filteredJobs.length === 1 ? " position" : " positions"}
          </div>

        </div>

        {loading ? (

          <div className="tf-jobs-state">
            <div className="tf-loading-spinner"></div>
            <h3>Finding opportunities</h3>
            <p>We're loading the available positions.</p>
          </div>

        ) : error ? (

          <div className="tf-jobs-state tf-jobs-error">
            <h3>Unable to load jobs</h3>
            <p>{error}</p>
          </div>

        ) : filteredJobs.length === 0 ? (

          <div className="tf-jobs-state">
            <div className="tf-jobs-empty-icon">
              <Search size={26} />
            </div>

            <h3>No positions found</h3>

            <p>
              {search
                ? "Try a different search keyword."
                : "There are currently no open positions."}
            </p>

            {search && (
              <button
                className="tf-reset-search"
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            )}
          </div>

        ) : (

          <div className="tf-job-cards">

            {filteredJobs.map((job) => {

              const rawSkills =
                job.required_skills || job.skills || [];

              const skills = Array.isArray(rawSkills)
                ? rawSkills
                : typeof rawSkills === "string"
                  ? rawSkills.split(",").map((s) => s.trim()).filter(Boolean)
                  : [];

              const jobType =
                job.type || job.employment_type || "Job";

              return (

                <article
                  className="tf-job-card"
                  key={job.job_id || job.id}
                >

                  {/* CARD HEADER */}
                  <div className="tf-job-card-header">

                    <div className="tf-job-title-area">

                      <div className="tf-job-icon">
                        <BriefcaseBusiness size={22} />
                      </div>

                      <div className="tf-job-title-content">

                        <h3>{job.title || "Untitled Position"}</h3>

                        <span className="tf-job-department">
                          {job.department || "General"}
                        </span>

                      </div>

                    </div>

                    <span className="tf-job-type-badge">
                      {jobType}
                    </span>

                  </div>

                  {/* METADATA */}
                  <div className="tf-job-meta">

                    <span>
                      <MapPin size={16} />
                      {job.location || "Location not specified"}
                    </span>

                    <span>
                      <Building2 size={16} />
                      {job.department || "General"}
                    </span>

                  </div>

                  {/* DESCRIPTION */}
                  <p className="tf-job-description">
                    {job.description || "No job description available."}
                  </p>

                  {/* SKILLS */}
                  {skills.length > 0 && (

                    <div className="tf-job-skills-section">

                      <span className="tf-job-skills-label">
                        Required skills
                      </span>

                      <div className="tf-job-skills">

                        {skills.map((skill, index) => (
                          <span
                            className="tf-job-skill"
                            key={index}
                          >
                            {skill}
                          </span>
                        ))}

                      </div>

                    </div>

                  )}

                  {/* FOOTER */}
                  <div className="tf-job-card-footer">

                    <button
                      className="tf-view-job-button"
                      onClick={() =>
                        navigate(
                          `/candidate/jobs/${job.job_id || job.id}`
                        )
                      }
                    >
                      <span>View job details</span>
                      <ArrowRight size={17} />
                    </button>

                  </div>

                </article>

              );
            })}

          </div>

        )}

      </section>

    </div>
  );
}

export default CandidateJobsPage;
