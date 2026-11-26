import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllApplications,
  getJobs,
  screenAllApplications,
  getScreeningResult,
} from "../../services/api";

function ApplicationPage() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [scores, setScores] = useState({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedJob, setSelectedJob] = useState("");
  const [loading, setLoading] = useState(true);
  const [screening, setScreening] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==================================================
  // FETCH APPLICATIONS AND JOBS
  // ==================================================
  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      setError("");

      const [applicationData, jobData] = await Promise.all([
        getAllApplications(),
        getJobs(),
      ]);

      const applicationList = Array.isArray(applicationData)
        ? applicationData
        : applicationData?.applications || [];

      const jobList = Array.isArray(jobData)
        ? jobData
        : jobData?.jobs || [];

      setApplications(applicationList);
      setJobs(jobList);

      // Fetch screening scores for screened/reviewed applications
      const screenedApplications = applicationList.filter(
        (application) =>
          application.status === "screened" ||
          application.status === "reviewed"
      );

      const scoreResults = await Promise.all(
        screenedApplications.map(async (application) => {
          try {
            const result = await getScreeningResult(
              application.application_id
            );

            return {
              applicationId: application.application_id,
              score: result.match_percentage,
            };
          } catch (err) {
            console.warn(
              `Could not fetch score for application ${application.application_id}`,
              err
            );

            return {
              applicationId: application.application_id,
              score: null,
            };
          }
        })
      );

      const scoreMap = {};

      scoreResults.forEach((result) => {
        scoreMap[result.applicationId] = result.score;
      });

      setScores(scoreMap);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // AI SCREENING
  // ==================================================
  async function handleScreening() {
    if (!selectedJob) {
      setError("Please select a job before starting AI screening.");
      return;
    }

    try {
      setScreening(true);
      setError("");
      setMessage("");

      const result = await screenAllApplications(selectedJob);

      setMessage(
        `Screening completed! Screened: ${
          result.screened_count ?? 0
        }, Skipped: ${
          result.skipped_count ?? 0
        }, Failed: ${
          result.failed_count ?? 0
        }.`
      );

      await fetchApplications();
    } catch (err) {
      console.error("AI Screening Error:", err);
      setError(err.message || "AI screening failed.");
    } finally {
      setScreening(false);
    }
  }

  // ==================================================
  // GET JOB TITLE
  // ==================================================
  function getJobTitle(jobId) {
    const job = jobs.find(
      (j) => String(j.job_id) === String(jobId)
    );

    return job?.title || `Job ID: ${jobId}`;
  }

  // ==================================================
  // SEARCH AND FILTER
  // ==================================================
  const filteredApplications = applications.filter((application) => {
    const applicationId = String(application.application_id ?? "");
    const candidateId = String(application.candidate_id ?? "");
    const candidateName = String(application.candidate_name ?? "");
    const jobTitle = getJobTitle(application.job_id);
    const status = application.status || "submitted";

    const searchText = search.toLowerCase();

    const matchesSearch =
      applicationId.toLowerCase().includes(searchText) ||
      candidateId.toLowerCase().includes(searchText) ||
      candidateName.toLowerCase().includes(searchText) ||
      jobTitle.toLowerCase().includes(searchText) ||
      status.toLowerCase().includes(searchText);

    const matchesStatus =
      filterStatus === "All" || status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // ==================================================
  // SUMMARY COUNTS
  // ==================================================
  const submittedCount = applications.filter(
    (a) => a.status === "submitted"
  ).length;

  const screenedCount = applications.filter(
    (a) => a.status === "screened"
  ).length;

  const screeningFailedCount = applications.filter(
    (a) => a.status === "screening_failed"
  ).length;

  const reviewedCount = applications.filter(
    (a) => a.status === "reviewed"
  ).length;

  // ==================================================
  // UI
  // ==================================================
  return (
    <div className="applications-page">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>Applications</h1>
          <p>Review and manage candidate applications</p>
        </div>

        <button
          className="view-application-button"
          onClick={fetchApplications}
          disabled={loading || screening}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ============================================== */}
      {/* AI RESUME SCREENING */}
      {/* ============================================== */}
      <div className="applications-table-container">

        <div className="applications-table-header">
          <div>
            <h2>AI Resume Screening</h2>
            <p>
              Select a job to screen its submitted resumes using AI.
            </p>
          </div>
        </div>

        <div className="application-controls">

          {/* JOB SELECTOR */}
          <select
            value={selectedJob}
            onChange={(e) => {
              setSelectedJob(e.target.value);
              setError("");
              setMessage("");
            }}
          >
            <option value="">Select a job</option>

            {jobs.map((job) => (
              <option
                key={job.job_id}
                value={job.job_id}
              >
                {job.title} (ID: {job.job_id})
              </option>
            ))}
          </select>

          {/* SCREEN BUTTON */}
          <button
            className="view-application-button"
            onClick={handleScreening}
            disabled={!selectedJob || screening || loading}
          >
            {screening
              ? "AI Screening in Progress..."
              : "Screen All Applications"}
          </button>

        </div>

        {/* SCREENING PROGRESS */}
        {screening && (
          <p className="no-applications">
            AI is analyzing resumes. Please wait...
          </p>
        )}

        {/* SUCCESS MESSAGE */}
        {message && (
          <p
            style={{
              color: "#166534",
              background: "#dcfce7",
              padding: "12px 15px",
              borderRadius: "10px",
              marginTop: "15px",
            }}
          >
            {message}
          </p>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <p
            style={{
              color: "#991b1b",
              background: "#fee2e2",
              padding: "12px 15px",
              borderRadius: "10px",
              marginTop: "15px",
            }}
          >
            {error}
          </p>
        )}

      </div>

      {/* ============================================== */}
      {/* APPLICATION STATISTICS */}
      {/* ============================================== */}
      <div className="application-summary">

        <div className="application-summary-card">
          <h3>Total Applications</h3>
          <p>{applications.length}</p>
        </div>

        <div className="application-summary-card">
          <h3>Submitted</h3>
          <p>{submittedCount}</p>
        </div>

        <div className="application-summary-card">
          <h3>Screened</h3>
          <p>{screenedCount}</p>
        </div>

        <div className="application-summary-card">
          <h3>Reviewed</h3>
          <p>{reviewedCount}</p>
        </div>

        <div className="application-summary-card">
          <h3>Screening Failed</h3>
          <p>{screeningFailedCount}</p>
        </div>

      </div>

      {/* ============================================== */}
      {/* CANDIDATE APPLICATIONS */}
      {/* ============================================== */}
      <div className="applications-table-container">

        {/* TABLE HEADER */}
        <div className="applications-table-header">

          <h2>Candidate Applications</h2>

          <div className="application-controls">

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search candidate name, ID, application or job..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* STATUS FILTER */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="screened">Screened</option>
              <option value="screening_failed">
                Screening Failed
              </option>
              <option value="reviewed">Reviewed</option>
            </select>

          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <p className="no-applications">
            Loading applications...
          </p>
        )}

        {/* TABLE */}
        {!loading && !error && (
          <>

            <table className="applications-table">

              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Candidate</th>
                  <th>Applied For</th>
                  <th>Submitted On</th>
                  <th>Status</th>
                  <th>AI Score</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredApplications.map((application) => {
                  const id = application.application_id;
                  const candidateId = application.candidate_id;
                  const candidateName =
                    application.candidate_name || "Unknown";
                  const jobTitle = getJobTitle(application.job_id);
                  const status = application.status || "submitted";

                  const submittedDate = application.submitted_at
                    ? new Date(
                        application.submitted_at
                      ).toLocaleDateString()
                    : "N/A";

                  const score = scores[id];

                  return (
                    <tr key={id}>

                      {/* APPLICATION ID */}
                      <td>{id}</td>

                      {/* CANDIDATE */}
                      <td>
                        <div style={{ fontWeight: "700" }}>
                          {candidateName}
                        </div>

                        <small style={{ color: "#737373" }}>
                          ID: {candidateId}
                        </small>
                      </td>

                      {/* JOB TITLE */}
                      <td>{jobTitle}</td>

                      {/* SUBMISSION DATE */}
                      <td>{submittedDate}</td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`application-status ${status
                            .toLowerCase()
                            .replace(/_/g, "-")}`}
                        >
                          {status.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* AI SCORE */}
                      <td>
                        <span className="ai-score">
                          {score !== undefined && score !== null
                            ? `${score}%`
                            : "Not available"}
                        </span>
                      </td>

                      {/* VIEW */}
                      <td>
                        <button
                          className="view-application-button"
                          onClick={() =>
                            navigate(
                              `/recruiter/applications/${id}`
                            )
                          }
                        >
                          View
                        </button>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

            {/* NO RESULTS */}
            {filteredApplications.length === 0 && (
              <p className="no-applications">
                {applications.length === 0
                  ? "No applications have been submitted yet."
                  : "No applications match your search or filter."}
              </p>
            )}

          </>
        )}

        {/* ERROR */}
        {!loading && error && (
          <p className="no-applications">{error}</p>
        )}

      </div>

    </div>
  );
}

export default ApplicationPage;