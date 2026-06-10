const API_BASE = 'http://localhost:5000/api';

// Helper to build query string
const qs = (params) => new URLSearchParams(params).toString();

// Helper to make auth-aware requests (pass token as second arg)
const authHeaders = (token) =>
  token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };

export const api = {
  // ── Jobs (Public) ──────────────────────────────────────────────────────────
  getJobs: (params = {}) =>
    fetch(`${API_BASE}/jobs?${qs(params)}`).then((r) => r.json()),

  getJob: (id) =>
    fetch(`${API_BASE}/jobs/${id}`).then((r) => r.json()),

  // ── Jobs (Recruiter) ───────────────────────────────────────────────────────
  createJob: (data, token) =>
    fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateJob: (id, data, token) =>
    fetch(`${API_BASE}/jobs/${id}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteJob: (id, token) =>
    fetch(`${API_BASE}/jobs/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }).then((r) => r.json()),

  getApplications: (id, token) =>
    fetch(`${API_BASE}/jobs/${id}/applications`, {
      headers: authHeaders(token),
    }).then((r) => r.json()),

  updateApplicationStatus: (jobId, appId, status, token) =>
    fetch(`${API_BASE}/jobs/${jobId}/applications/${appId}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ status }),
    }).then((r) => r.json()),

  // ── Applications (Candidate) ───────────────────────────────────────────────
  applyToJob: (id, data, token) =>
    fetch(`${API_BASE}/jobs/${id}/apply`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // ── Auth ───────────────────────────────────────────────────────────────────
  register: (data) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  login: (data) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  getMe: (token) =>
    fetch(`${API_BASE}/auth/me`, { headers: authHeaders(token) }).then((r) =>
      r.json()
    ),

  // ── User Dashboard & Saved Jobs ────────────────────────────────────────────
  getDashboard: (token) =>
    fetch(`${API_BASE}/user/dashboard`, { headers: authHeaders(token) }).then(
      (r) => r.json()
    ),

  getSavedJobs: (token) =>
    fetch(`${API_BASE}/user/saved-jobs`, { headers: authHeaders(token) }).then(
      (r) => r.json()
    ),

  saveJob: (jobId, token) =>
    fetch(`${API_BASE}/user/saved-jobs/${jobId}`, {
      method: 'POST',
      headers: authHeaders(token),
    }).then((r) => r.json()),

  unsaveJob: (jobId, token) =>
    fetch(`${API_BASE}/user/saved-jobs/${jobId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }).then((r) => r.json()),
};
