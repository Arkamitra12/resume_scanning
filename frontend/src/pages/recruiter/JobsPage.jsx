import { useEffect, useState } from "react";
import {
  createJob,
  getAllApplications,
  default as apiRequest,
} from "../../services/api";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingJobId, setUpdatingJobId] = useState(null);

  const [summary, setSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // =====================================================
  // FETCH JOBS AND APPLICATIONS
  // =====================================================
  async function fetchJobs() {
    try {
      setLoading(true);

      const [jobsData, applicationsData] = await Promise.all([
        apiRequest("/jobs/recruiter/all"),
        getAllApplications(),
      ]);

      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setApplications(
        Array.isArray(applicationsData) ? applicationsData : []
      );
    } catch (err) {
      setError(err.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  // =====================================================
  // APPLICANT COUNT
  // =====================================================
  function getApplicantCount(jobId) {
    return applications.filter(
      (application) => Number(application.job_id) === Number(jobId)
    ).length;
  }

  // =====================================================
  // CREATE JOB
  // =====================================================
  async function handleCreateJob(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim() || !description.trim() || !skills.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const requiredSkills = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    try {
      await createJob({
        title: title.trim(),
        description: description.trim(),
        required_skills: requiredSkills,
      });

      setTitle("");
      setDescription("");
      setSkills("");

      setSuccess("Job created successfully.");
      await fetchJobs();
    } catch (err) {
      setError(err.message || "Failed to create job.");
    }
  }

  // =====================================================
  // UPDATE JOB STATUS
  // =====================================================
  async function handleStatusChange(job, newStatus) {
    const jobId = job.job_id || job.id;

    setError("");
    setSuccess("");

    try {
      setUpdatingJobId(jobId);

      await apiRequest(
        `/jobs/${jobId}/status?status_value=${newStatus}`,
        {
          method: "PATCH",
        }
      );

      setJobs((previousJobs) =>
        previousJobs.map((currentJob) =>
          Number(currentJob.job_id) === Number(jobId)
            ? { ...currentJob, status: newStatus }
            : currentJob
        )
      );

      setSuccess(
        newStatus === "open"
          ? "Job is now active and visible to candidates."
          : "Job is now inactive and hidden from candidates."
      );
    } catch (err) {
      setError(err.message || "Failed to update job status.");
    } finally {
      setUpdatingJobId(null);
    }
  }

  // =====================================================
  // VIEW JOB SUMMARY
  // =====================================================
  async function handleViewSummary(job) {
    const jobId = job.job_id || job.id;

    setSummaryLoading(true);
    setShowSummary(true);
    setSummary(null);
    setError("");

    try {
      const summaryData = await apiRequest(`/jobs/${jobId}/summary`);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message || "Failed to load job summary.");
      setShowSummary(false);
    } finally {
      setSummaryLoading(false);
    }
  }

  // =====================================================
  // SUMMARY DISPLAY HELPER
  // =====================================================
  function formatKey(key) {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="recruiter-jobs-management">
      {/* PAGE HEADER */}
      <h1>Job Management</h1>
      <p>Create and manage job postings.</p>

      {/* MESSAGES */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          {success}
        </div>
      )}

      {/* ================================================= */}
      {/* CREATE JOB FORM */}
      {/* ================================================= */}
      <div
        className="job-create-card"
        style={{
          background: "#ffffff",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "25px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2>Post a New Job</h2>

        <form onSubmit={handleCreateJob}>
          {/* JOB TITLE */}
          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>Job Title</strong>
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter job title"
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* DESCRIPTION */}
          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>Description</strong>
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter job description"
              rows={5}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* REQUIRED SKILLS */}
          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>Required Skills</strong>
            </label>

            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Python, SQL, React (comma separated)"
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* POST JOB BUTTON */}
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Post Job
          </button>
        </form>
      </div>

      {/* ================================================= */}
      {/* JOB STATISTICS */}
      {/* ================================================= */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {/* TOTAL JOBS */}
        <div
          className="job-stat-card"
          style={{
            padding: "20px",
            background: "#f3f4f6",
            borderRadius: "10px",
            minWidth: "150px",
          }}
        >
          <h3>Total Jobs</h3>
          <h2>{jobs.length}</h2>
        </div>

        {/* ACTIVE JOBS */}
        <div
          className="job-stat-card"
          style={{
            padding: "20px",
            background: "#dcfce7",
            borderRadius: "10px",
            minWidth: "150px",
          }}
        >
          <h3>Active Jobs</h3>
          <h2>
            {jobs.filter((job) => job.status === "open").length}
          </h2>
        </div>

        {/* INACTIVE JOBS */}
        <div
          className="job-stat-card"
          style={{
            padding: "20px",
            background: "#fee2e2",
            borderRadius: "10px",
            minWidth: "150px",
          }}
        >
          <h3>Inactive Jobs</h3>
          <h2>
            {jobs.filter((job) => job.status === "closed").length}
          </h2>
        </div>

        {/* TOTAL APPLICANTS */}
        <div
          className="job-stat-card"
          style={{
            padding: "20px",
            background: "#e0e7ff",
            borderRadius: "10px",
            minWidth: "150px",
          }}
        >
          <h3>Total Applicants</h3>
          <h2>{applications.length}</h2>
        </div>
      </div>

      {/* ================================================= */}
      {/* JOB TABLE */}
      {/* ================================================= */}
      <div
        className="job-table-card"
        style={{
          background: "#ffffff",
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
          overflowX: "auto",
        }}
      >
        <h2>All Jobs</h2>

        {loading ? (
          <p>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p>No jobs available.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "850px",
            }}
          >
            <thead>
              <tr>
                {[
                  "ID",
                  "Job Title",
                  "Applicants",
                  "Status",
                  "Created",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => {
                const jobId = job.job_id || job.id;

                return (
                  <tr key={jobId}>
                    {/* ID */}
                    <td style={{ padding: "12px" }}>{jobId}</td>

                    {/* JOB TITLE */}
                    <td style={{ padding: "12px" }}>
                      {job.title}
                    </td>

                    {/* APPLICANTS */}
                    <td style={{ padding: "12px" }}>
                      {getApplicantCount(jobId)}
                    </td>

                    {/* STATUS DROPDOWN */}
                    <td style={{ padding: "12px" }}>
                      <select
                        value={job.status}
                        disabled={updatingJobId === jobId}
                        onChange={(e) =>
                          handleStatusChange(job, e.target.value)
                        }
                        style={{
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid #d1d5db",
                          background:
                            job.status === "open"
                              ? "#dcfce7"
                              : "#fee2e2",
                          color:
                            job.status === "open"
                              ? "#166534"
                              : "#991b1b",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        <option value="open">Active</option>
                        <option value="closed">Inactive</option>
                      </select>

                      {updatingJobId === jobId && (
                        <span style={{ marginLeft: "8px" }}>
                          Updating...
                        </span>
                      )}
                    </td>

                    {/* CREATED DATE */}
                    <td style={{ padding: "12px" }}>
                      {job.created_at
                        ? new Date(job.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: "12px" }}>
                      <button
                        onClick={() => handleViewSummary(job)}
                        style={{
                          padding: "8px 12px",
                          background: "#2563eb",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        View Summary
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ================================================= */}
      {/* JOB SUMMARY MODAL */}
      {/* ================================================= */}
      {showSummary && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            className="job-summary-modal"
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h2>Job Summary</h2>

            {/* LOADING */}
            {summaryLoading ? (
              <p>Loading summary...</p>
            ) : summary ? (
              <div>
                {Object.entries(summary).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <strong>{formatKey(key)}:</strong>{" "}
                    {value === null || value === undefined
                      ? "N/A"
                      : typeof value === "number"
                      ? value
                      : String(value)}
                  </div>
                ))}
              </div>
            ) : (
              <p>No summary available.</p>
            )}

            {/* CLOSE BUTTON */}
            <button
              onClick={() => {
                setShowSummary(false);
                setSummary(null);
              }}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                background: "#374151",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}