
import { useState, useEffect } from "react";
import { getMyApplications } from "../../services/api";

function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }

  const getDecisionLabel = (decision) => {
    switch (decision) {
      case "proceed":
        return "Proceed";
      case "hold":
        return "On Hold";
      case "do_not_proceed":
        return "Do Not Proceed";
      default:
        return "Pending";
    }
  };

  const getStatusLabel = (status) => {
    return status?.replace(/_/g, " ") || "Unknown";
  };

  if (loading) {
    return (
      <div className="my-applications-page">
        <h1>Loading applications...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-applications-page">
        <p className="form-error">{error}</p>
      </div>
    );
  }

  const reviewedCount = applications.filter(
    (a) => a.reviewed_at || a.application_status === "reviewed"
  ).length;

  const pendingCount = applications.length - reviewedCount;

  return (
    <div className="my-applications-page">
      <div className="applications-header">
        <span className="applications-eyebrow">CANDIDATE PORTAL</span>
        <h1>My Applications</h1>
        <p>Keep track of your applications and recruiter feedback.</p>
      </div>

      <div className="applications-summary">
        <div className="application-summary-card">
          <div className="application-summary-icon">01</div>
          <div>
            <h3>Total Applications</h3>
            <h2>{applications.length}</h2>
          </div>
        </div>

        <div className="application-summary-card">
          <div className="application-summary-icon">02</div>
          <div>
            <h3>Recruiter Reviewed</h3>
            <h2>{reviewedCount}</h2>
          </div>
        </div>
      </div>

      <div className="applications-table-card">
        <div className="applications-history-header">
          <div>
            <h2>Application History</h2>
            <p>View the progress and feedback for each application.</p>
          </div>

          <span className="applications-count">
            {applications.length} Applications
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="applications-empty">
            <h3>No applications yet</h3>
            <p>Once you apply for a job, it will appear here.</p>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <div
                className="application-detail-card"
                key={application.application_id}
              >
                <div className="application-detail-top">
                  <div className="application-job-info">
                    <div className="application-job-icon">▣</div>

                    <div>
                      <h3>
                        {application.job_title || "Job Application"}
                      </h3>

                      <p>
                        Application ID: {application.application_id}
                      </p>
                    </div>
                  </div>

                  <span className="application-status-badge">
                    {getStatusLabel(application.application_status)}
                  </span>
                </div>

                <div className="application-review-info">
                  <div>
                    <label>Recruiter Decision</label>

                    <span className="application-decision-badge">
                      {getDecisionLabel(application.final_decision)}
                    </span>
                  </div>

                  <div>
                    <label>Review Date</label>

                    <strong>
                      {application.reviewed_at
                        ? new Date(application.reviewed_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "Not reviewed yet"}
                    </strong>
                  </div>
                </div>

                {application.recruiter_notes && (
                  <div className="application-feedback">
                    <label>Recruiter Feedback</label>
                    <p>{application.recruiter_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplicationsPage;
