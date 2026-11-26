
import React, { useEffect, useState } from "react";
import { getJobs, getAllApplications, default as apiRequest } from "../../services/api";
import {
  BriefcaseBusiness,
  FileText,
  Clock3,
  Bot,
  Users,
  ChartColumnIncreasing,
} from "lucide-react";

const RecruitDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [screeningScores, setScreeningScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [jobsData, applicationsData] = await Promise.all([
          getJobs(),
          getAllApplications(),
        ]);

        const safeJobs = Array.isArray(jobsData) ? jobsData : [];
        const safeApplications = Array.isArray(applicationsData)
          ? applicationsData
          : [];

        setJobs(safeJobs);
        setApplications(safeApplications);

        const scoreResults = await Promise.all(
          safeApplications.map(async (application) => {
            try {
              const result = await apiRequest(
                `/applications/${application.application_id}/screening`
              );

              return {
                application_id: application.application_id,
                score: result.match_percentage,
              };
            } catch {
              return {
                application_id: application.application_id,
                score: null,
              };
            }
          })
        );

        const scoreMap = {};

        scoreResults.forEach((result) => {
          scoreMap[result.application_id] = result.score;
        });

        setScreeningScores(scoreMap);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalJobs = jobs.length;
  const totalApplications = applications.length;

  const pendingReviews = applications.filter(
    (application) => application.status === "submitted"
  ).length;

  const aiScreened = applications.filter(
    (application) =>
      application.status === "screened" ||
      application.status === "reviewed"
  ).length;

  const reviewedApplications = applications.filter(
    (application) => application.status === "reviewed"
  ).length;

  const validScores = Object.values(screeningScores).filter(
    (score) => typeof score === "number"
  );

  const averageScore =
    validScores.length > 0
      ? Math.round(
          validScores.reduce((total, score) => total + score, 0) /
            validScores.length
        )
      : 0;

  const recentApplications = [...applications]
    .sort(
      (a, b) =>
        new Date(b.submitted_at) - new Date(a.submitted_at)
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Total Job Openings",
      value: totalJobs,
      description: "Currently available positions",
      icon: BriefcaseBusiness,
    },
    {
      title: "Total Applications",
      value: totalApplications,
      description: "Candidates have applied",
      icon: FileText,
    },
    {
      title: "Pending Reviews",
      value: pendingReviews,
      description: "Awaiting review",
      icon: Clock3,
    },
    {
      title: "AI Screened",
      value: aiScreened,
      description: "Screening completed",
      icon: Bot,
    },
    {
      title: "Reviewed Applications",
      value: reviewedApplications,
      description: "Recruiter decisions recorded",
      icon: Users,
    },
    {
      title: "Average AI Match Score",
      value: `${averageScore}%`,
      description: "Average of available screening scores",
      icon: ChartColumnIncreasing,
    },
  ];

  if (loading) {
    return (
      <div className="tf-dashboard-page">
        <div className="tf-dashboard-state">
          <div className="tf-dashboard-spinner"></div>
          <h2>Recruiter Dashboard</h2>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tf-dashboard-page">
        <div className="tf-dashboard-state">
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tf-dashboard-page">
      <div className="tf-dashboard-header">
        <span className="tf-dashboard-eyebrow">RECRUITER PORTAL</span>
        <h1>Recruiter Dashboard</h1>
        <p>Overview of your recruitment activity</p>
      </div>

      <div className="tf-dashboard-stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div className="tf-dashboard-stat-card" key={index}>
              <div className="tf-dashboard-stat-icon">
                <Icon size={26} strokeWidth={1.8} />
              </div>

              <div className="tf-dashboard-stat-content">
                <h3>{stat.title}</h3>
                <h2>{stat.value}</h2>
                <p>{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="tf-dashboard-recent-card">
        <div className="tf-dashboard-section-header">
          <div>
            <h2>Recent Applications</h2>
            <p>Latest candidate applications received</p>
          </div>

          <span className="tf-dashboard-count">
            {applications.length} Applications
          </span>
        </div>

        {recentApplications.length === 0 ? (
          <div className="tf-dashboard-empty">
            <FileText size={35} strokeWidth={1.5} />
            <h3>No applications yet</h3>
            <p>Applications will appear here when candidates apply.</p>
          </div>
        ) : (
          <div className="tf-dashboard-table-wrapper">
            <table className="tf-dashboard-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Job ID</th>
                  <th>Applied On</th>
                  <th>AI Score</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentApplications.map((application) => (
                  <tr key={application.application_id}>
                    <td>
                      <span className="tf-dashboard-application-id">
                        #{application.application_id}
                      </span>
                    </td>

                    <td>{application.job_id}</td>

                    <td>
                      {application.submitted_at
                        ? new Date(application.submitted_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "N/A"}
                    </td>

                    <td>
                      <span className="tf-dashboard-score">
                        {typeof screeningScores[application.application_id] ===
                        "number"
                          ? `${screeningScores[application.application_id]}%`
                          : "Not screened"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`tf-dashboard-status ${application.status
                          ?.replace(/_/g, "-")
                          .toLowerCase()}`}
                      >
                        {application.status?.replace(/_/g, " ") || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruitDashboard;
