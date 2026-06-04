const API_BASE = 'http://localhost:5000/api';

export const api = {
  // Jobs
  getJobs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/jobs?${qs}`).then(res => res.json());
  },
  getJob: (id) =>
    fetch(`${API_BASE}/jobs/${id}`).then(res => res.json()),

  createJob: (data) =>
    fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  updateJob: (id, data) =>
    fetch(`${API_BASE}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  deleteJob: (id) =>
    fetch(`${API_BASE}/jobs/${id}`, { method: 'DELETE' }).then(res => res.json()),

  // Applications
  applyToJob: (id, data) =>
    fetch(`${API_BASE}/jobs/${id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  getApplications: (id) =>
    fetch(`${API_BASE}/jobs/${id}/applications`).then(res => res.json()),
};
