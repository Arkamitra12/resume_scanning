
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getApplicationById,
  getJobs,
  default as apiRequest,
} from "../../services/api";

function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [screening, setScreening] = useState(null);
  const [review, setReview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [screeningLoading, setScreeningLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);

  const [error, setError] = useState("");
  const [screeningError, setScreeningError] = useState("");
  const [reviewError, setReviewError] = useState("");

  // Human review form states
  const [reviewerName, setReviewerName] = useState("");
  const [reviewDecision, setReviewDecision] = useState("proceed");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitMessage, setReviewSubmitMessage] = useState("");

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  async function fetchApplicationDetails() {
    setLoading(true);
    setScreeningLoading(true);
    setReviewLoading(true);

    setError("");
    setScreeningError("");
    setReviewError("");

    try {
      const [applicationData, jobData] = await Promise.all([
        getApplicationById(id),
        getJobs(),
      ]);

      setApplication(applicationData);

      const jobList = Array.isArray(jobData)
        ? jobData
        : jobData?.jobs || [];

      setJobs(jobList);
    } catch (err) {
      console.error("Application fetch error:", err);
      setError(err.message || "Failed to load application details.");
    } finally {
      setLoading(false);
    }

    // Fetch AI screening report
    try {
      const screeningData = await apiRequest(
        `/applications/${id}/screening`
      );

      setScreening(screeningData);
    } catch (err) {
      console.error("Screening fetch error:", err);
      setScreeningError(
        err.message || "Screening report not available."
      );
    } finally {
      setScreeningLoading(false);
    }

    // Fetch saved recruiter human review
    try {
      const reviewData = await apiRequest(
        `/applications/${id}/review`
      );

      setReview(reviewData);
      setReviewError("");
    } catch (err) {
      console.error("Human review fetch error:", err);
      setReview(null);
      setReviewError(
        err.message || "No human review has been submitted yet."
      );
    } finally {
      setReviewLoading(false);
    }
  }

  // Submit recruiter human review
  async function submitHumanReview(e) {
    e.preventDefault();

    setReviewSubmitMessage("");

    if (!reviewerName.trim()) {
      setReviewSubmitMessage("Please enter the reviewer name.");
      return;
    }

    setReviewSubmitting(true);

    try {
      const reviewData = await apiRequest(
        `/applications/${id}/review`,
        {
          method: "POST",
          body: JSON.stringify({
            reviewer: reviewerName.trim(),
            decision: reviewDecision,
            notes: reviewNotes.trim(),
          }),
        }
      );

      setReview(reviewData);
      setReviewError("");

      setReviewSubmitMessage("Review saved successfully!");

      // Fetch the saved review again
      try {
        const savedReview = await apiRequest(
          `/applications/${id}/review`
        );

        setReview(savedReview);
      } catch (refreshError) {
        console.error("Saved review refresh error:", refreshError);
      }
    } catch (err) {
      console.error("Review submission error:", err);

      setReviewSubmitMessage(
        err.message || "Failed to save review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  }

  const job = jobs.find(
    (j) => String(j.job_id) === String(application?.job_id)
  );

  const jobTitle = job?.title || `Job ID: ${application?.job_id}`;

  if (loading) {
    return (
      <div className="candidate-detail-page">
        <p>Loading application details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="candidate-detail-page">
        <button
          className="back-button"
          onClick={() => navigate("/recruiter/applications")}
        >
          ← Back to Applications
        </button>

        <h2>{error}</h2>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="candidate-detail-page">
        <button
          className="back-button"
          onClick={() => navigate("/recruiter/applications")}
        >
          ← Back to Applications
        </button>

        <h2>Application not found</h2>
      </div>
    );
  }

  const status = application.status || "submitted";

  const submittedDate = application.submitted_at
    ? new Date(application.submitted_at).toLocaleString()
    : "N/A";

  // Helper to display requirement status
  function formatRequirementStatus(value) {
    if (!value) return "Unknown";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return (
    <div className="candidate-detail-page">

      {/* Back Button */}
      <button
        className="back-button"
        onClick={() => navigate("/recruiter/applications")}
      >
        ← Back to Applications
      </button>

      {/* Candidate Header */}
      <div className="candidate-detail-header">

        <div className="candidate-profile">

          <div className="candidate-avatar">
            {application.candidate_id}
          </div>

          <div>
            <h1>
              {application.candidate_name
                ? application.candidate_name
                : `Candidate #${application.candidate_id}`}
            </h1>

            <p>
              Application ID: {application.application_id}
            </p>

            <span className="candidate-job-label">
              Applied for {jobTitle}
            </span>
          </div>

        </div>

        <div className="match-score-card">
          <span>Application Status</span>

          <div
            className="match-score"
            style={{ fontSize: "1.5rem" }}
          >
            {status.replace(/_/g, " ")}
          </div>

          <p>Current backend status</p>
        </div>

      </div>

      {/* Application Information */}
      <div className="candidate-info-grid">

        <div className="candidate-info-card">
          <span>Candidate ID</span>
          <h3>{application.candidate_id}</h3>
        </div>

        <div className="candidate-info-card">
          <span>Application ID</span>
          <h3>{application.application_id}</h3>
        </div>

        <div className="candidate-info-card">
          <span>Job ID</span>
          <h3>{application.job_id}</h3>
        </div>

        <div className="candidate-info-card">
          <span>Applied Position</span>
          <h3>{jobTitle}</h3>
        </div>

        <div className="candidate-info-card">
          <span>Submitted On</span>
          <h3>{submittedDate}</h3>
        </div>

        <div className="candidate-info-card">
          <span>Application Status</span>
          <h3>{status.replace(/_/g, " ")}</h3>
        </div>

      </div>

      {/* AI Screening Report */}
      <div className="applications-table-container">
        <h2>AI Screening Report</h2>

        {screeningLoading && (
          <p>Loading AI screening report...</p>
        )}

        {!screeningLoading && screeningError && (
          <p>{screeningError}</p>
        )}

        {!screeningLoading && screening && (
          <>
            {/* Match Percentage and AI Model */}
            <div className="candidate-info-grid">

              <div className="candidate-info-card">
                <span>AI Match Percentage</span>

                <h3>
                  {screening.match_percentage != null
                    ? `${screening.match_percentage}%`
                    : "N/A"}
                </h3>
              </div>

              <div className="candidate-info-card">
                <span>AI Model</span>

                <h3>
                  {screening.model_name || "Not available"}
                </h3>
              </div>

            </div>

            {/* AI Summary */}
            <div style={{ marginTop: "25px" }}>
              <h3>AI Summary</h3>

              <p style={{ lineHeight: "1.8" }}>
                {screening.summary || "No summary available."}
              </p>
            </div>

            {/* Extracted Skills */}
            <div style={{ marginTop: "25px" }}>
              <h3>Extracted Skills</h3>

              {Array.isArray(screening.extracted_skills) &&
              screening.extracted_skills.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginTop: "15px",
                  }}
                >
                  {screening.extracted_skills.map(
                    (skill, index) => (
                      <span
                        key={index}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "10px",
                          background: "#e8f0ff",
                          color: "#234b8b",
                          fontWeight: "500",
                        }}
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p>No skills extracted.</p>
              )}
            </div>

            {/* Requirement Evaluation */}
            <div style={{ marginTop: "30px" }}>
              <h3>Requirement Evaluation</h3>

              {Array.isArray(screening.requirement_checks) &&
              screening.requirement_checks.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table className="applications-table">
                    <thead>
                      <tr>
                        <th>Requirement</th>
                        <th>Status</th>
                        <th>Evidence</th>
                      </tr>
                    </thead>

                    <tbody>
                      {screening.requirement_checks.map(
                        (check, index) => (
                          <tr key={index}>
                            <td>{check.requirement}</td>

                            <td>
                              <span
                                className={`application-status ${
                                  check.status
                                    ?.toLowerCase()
                                    .replace(/_/g, "-")
                                }`}
                              >
                                {formatRequirementStatus(
                                  check.status
                                )}
                              </span>
                            </td>

                            <td>
                              {check.evidence ||
                                "No evidence provided"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No requirement evaluation available.</p>
              )}
            </div>

            {/* Interview Questions */}
            <div style={{ marginTop: "30px" }}>
              <h3>Suggested Interview Questions</h3>

              {Array.isArray(screening.interview_questions) &&
              screening.interview_questions.length > 0 ? (
                <ol style={{ lineHeight: "2" }}>
                  {screening.interview_questions.map(
                    (question, index) => (
                      <li key={index}>{question}</li>
                    )
                  )}
                </ol>
              ) : (
                <p>No interview questions available.</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Recruiter Human Review */}
      <div
        className="applications-table-container"
        style={{ marginTop: "30px" }}
      >
        <h2>Recruiter Human Review</h2>

        <p>
          Review the recruiter's saved assessment and final
          decision for this application.
        </p>

        {/* Previously Saved Review */}
        {reviewLoading && (
          <p>Loading human review...</p>
        )}

        {!reviewLoading && review && (
          <div style={{ marginTop: "20px" }}>

            {/* Decision */}
            <div className="candidate-info-grid">

              <div className="candidate-info-card">
                <span>Recruiter's Decision</span>

                <h3>
                  {review.decision
                    ?.replace(/_/g, " ")
                    .replace(/\b\w/g, (char) =>
                      char.toUpperCase()
                    ) || "N/A"}
                </h3>
              </div>

              <div className="candidate-info-card">
                <span>Reviewer Name</span>

                <h3>
                  {review.reviewer || "N/A"}
                </h3>
              </div>

              <div className="candidate-info-card">
                <span>Review ID</span>

                <h3>
                  {review.review_id ?? "N/A"}
                </h3>
              </div>

              <div className="candidate-info-card">
                <span>Application ID</span>

                <h3>
                  {review.application_id ?? id}
                </h3>
              </div>

            </div>

            {/* Notes */}
            <div style={{ marginTop: "25px" }}>
              <h3>Review Notes</h3>

              <div
                style={{
                  padding: "20px",
                  borderRadius: "12px",
                  background: "rgba(128,128,128,0.08)",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.8",
                }}
              >
                {review.notes || "No review notes provided."}
              </div>
            </div>

            {/* Reviewed Date */}
            <div style={{ marginTop: "20px" }}>
              <h3>Reviewed On</h3>

              <p>
                {review.reviewed_at
                  ? new Date(
                      review.reviewed_at
                    ).toLocaleString()
                  : "N/A"}
              </p>
            </div>

          </div>
        )}

        {!reviewLoading && !review && (
          <p style={{ marginTop: "15px" }}>
            No human review has been submitted yet.
          </p>
        )}

        {/* Human Review Submission Form */}
        <div
          style={{
            marginTop: "30px",
            paddingTop: "25px",
            borderTop: "1px solid rgba(128,128,128,0.2)",
          }}
        >
          <h3>Submit Human Review</h3>

          <form onSubmit={submitHumanReview}>

            {/* Reviewer Name */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Reviewer Name
              </label>

              <input
                type="text"
                value={reviewerName}
                onChange={(e) =>
                  setReviewerName(e.target.value)
                }
                placeholder="Enter your name"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Decision */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Final Decision
              </label>

              <select
                value={reviewDecision}
                onChange={(e) =>
                  setReviewDecision(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              >
                <option value="proceed">
                  Proceed
                </option>

                <option value="hold">
                  On Hold
                </option>

                <option value="do_not_proceed">
                  Do Not Proceed
                </option>
              </select>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Review Notes
              </label>

              <textarea
                value={reviewNotes}
                onChange={(e) =>
                  setReviewNotes(e.target.value)
                }
                placeholder="Enter your assessment of the candidate..."
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Submission Message */}
            {reviewSubmitMessage && (
              <p
                style={{
                  color: reviewSubmitMessage.includes(
                    "successfully"
                  )
                    ? "green"
                    : "red",
                  marginBottom: "15px",
                }}
              >
                {reviewSubmitMessage}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="view-application-button"
              disabled={reviewSubmitting}
            >
              {reviewSubmitting
                ? "Saving Review..."
                : "Submit Human Review"}
            </button>

          </form>
        </div>
      </div>

      {/* Refresh Button */}
      <div style={{ marginTop: "25px" }}>
        <button
          className="view-application-button"
          onClick={fetchApplicationDetails}
        >
          Refresh Application Details
        </button>
      </div>

    </div>
  );
}

export default ApplicationDetails;
