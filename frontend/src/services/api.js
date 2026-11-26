                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    const API_BASE_URL = "http://127.0.0.1:8000";

// Common API request function
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Don't set Content-Type when sending FormData
  if (!(options.body instanceof FormData) && options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);
if (!response.ok) {
  const errorMessage =
    typeof data?.detail === "string"
      ? data.detail
      : data?.detail
        ? JSON.stringify(data.detail)
        : JSON.stringify(data) || "API request failed";

  throw new Error(errorMessage);
}

  return data;
}

// Candidate registration
export const registerCandidate = (data) =>
  apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Login (candidate or recruiter)
export const loginUser = (data) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Get all jobs
export const getJobs = () =>
  apiRequest("/jobs");

// Get job details
export const getJobById = (jobId) =>
  apiRequest(`/jobs/${jobId}`);

// Recruiter: create a job
export const createJob = (data) =>
  apiRequest("/jobs", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Candidate: submit application with PDF resume
export const submitApplication = (jobId, resumeFile) => {
  const formData = new FormData();
  formData.append("job_id", jobId);
  formData.append("resume", resumeFile);

  return apiRequest("/applications", {
    method: "POST",
    body: formData,
  });
};

// Candidate: get own application statuses
export const getMyApplications = () =>
  apiRequest("/candidates/my-applications");

// Recruiter: get all applications
export const getAllApplications = () =>
  apiRequest("/applications");

// Recruiter: get application details
export const getApplicationById = (applicationId) =>
  apiRequest(`/applications/${applicationId}`);

// Recruiter: get AI screening result for an application
export const getScreeningResult = (applicationId) =>
  apiRequest(`/applications/${applicationId}/screening`);

// Recruiter: screen all applications for a job
export const screenAllApplications = (jobId) =>
  apiRequest(`/applications/screen-all/${jobId}`, {
    method: "POST",
  });

// Recruiter: get job summary
export const getJobSummary = (jobId) =>
  apiRequest(`/jobs/${jobId}/summary`);

// Logout
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
// Recruiter: submit human review





// Recruiter: submit human review
export const submitApplicationReview = (applicationId, reviewData) =>
  apiRequest(`/applications/${applicationId}/review`, {
    method: "POST",
    body: JSON.stringify(reviewData),
  });

// Recruiter: get existing human review
export const getApplicationReview = (applicationId) =>
  apiRequest(`/applications/${applicationId}/review`);
// Recruiter: get saved human review

export default apiRequest;