import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const STATUS_COLORS = {
  Pending: 'status-pending',
  Reviewed: 'status-reviewed',
  Accepted: 'status-accepted',
  Rejected: 'status-rejected',
};

export default function RecruiterDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedJob, setExpandedJob] = useState(null);
  const [jobApplications, setJobApplications] = useState({});
  const [loadingApps, setLoadingApps] = useState({});

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard(token);
      if (res.success) setData(res);
      else setError(res.message || 'Failed to load dashboard');
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const toggleApplications = async (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
      return;
    }
    setExpandedJob(jobId);
    if (!jobApplications[jobId]) {
      setLoadingApps((p) => ({ ...p, [jobId]: true }));
      try {
        const res = await api.getApplications(jobId, token);
        if (res.success) setJobApplications((p) => ({ ...p, [jobId]: res.data }));
      } finally {
        setLoadingApps((p) => ({ ...p, [jobId]: false }));
      }
    }
  };

  const updateStatus = async (jobId, appId, status) => {
    const res = await api.updateApplicationStatus(jobId, appId, status, token);
    if (res.success) {
      setJobApplications((prev) => ({
        ...prev,
        [jobId]: prev[jobId].map((a) => (a._id === appId ? { ...a, status } : a)),
      }));
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="loading-wrapper">
            <div className="spinner" />
            <span>Loading your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="alert alert-error">⚠️ {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              👋 Welcome, <span>{user?.name}</span>
            </h1>
            <p className="dashboard-subtitle">Recruiter Dashboard — manage your job postings</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/jobs/create')}
            id="post-job-btn"
          >
            + Post New Job
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid" id="recruiter-stats">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{data?.stats?.totalJobsPosted ?? 0}</div>
            <div className="stat-label">Jobs Posted</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{data?.stats?.totalApplicationsReceived ?? 0}</div>
            <div className="stat-label">Total Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">
              {data?.jobs?.filter((j) => j.applicationCount > 0).length ?? 0}
            </div>
            <div className="stat-label">Jobs with Applicants</div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="dashboard-section">
          <h2 className="section-heading">Your Job Postings</h2>

          {data?.jobs?.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No jobs posted yet</h3>
              <p>Click "Post New Job" to get started</p>
            </div>
          ) : (
            <div className="recruiter-jobs" id="recruiter-jobs-list">
              {data?.jobs?.map((job) => (
                <div key={job._id} className="recruiter-job-card">
                  <div className="recruiter-job-header">
                    <div className="recruiter-job-info">
                      <h3>{job.title}</h3>
                      <div className="recruiter-job-meta">
                        <span className={`type-badge type-${job.type?.toLowerCase().replace('-', '')}`}>
                          {job.type}
                        </span>
                        <span>📍 {job.location}</span>
                        <span>🏢 {job.company}</span>
                      </div>
                    </div>
                    <div className="recruiter-job-actions">
                      <span className="app-count-badge">
                        {job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}
                      </span>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => toggleApplications(job._id)}
                        id={`view-apps-${job._id}`}
                      >
                        {expandedJob === job._id ? '▲ Hide' : '👥 View Applicants'}
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/jobs/${job._id}/edit`)}
                        id={`edit-job-${job._id}`}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => navigate(`/jobs/${job._id}`)}
                      >
                        🔗 View
                      </button>
                    </div>
                  </div>

                  {/* Expandable Applications */}
                  {expandedJob === job._id && (
                    <div className="applications-panel" id={`apps-panel-${job._id}`}>
                      {loadingApps[job._id] ? (
                        <div className="loading-wrapper">
                          <div className="spinner" />
                          <span>Loading applications...</span>
                        </div>
                      ) : !jobApplications[job._id] || jobApplications[job._id].length === 0 ? (
                        <div className="alert alert-info">No applications yet for this job.</div>
                      ) : (
                        <table className="applications-table">
                          <thead>
                            <tr>
                              <th>Applicant</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Applied</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {jobApplications[job._id].map((app) => (
                              <tr key={app._id}>
                                <td><strong>{app.name}</strong></td>
                                <td>{app.email}</td>
                                <td>{app.phone}</td>
                                <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                                <td>
                                  <select
                                    className={`status-select ${STATUS_COLORS[app.status]}`}
                                    value={app.status}
                                    onChange={(e) => updateStatus(job._id, app._id, e.target.value)}
                                    id={`status-${app._id}`}
                                  >
                                    {['Pending', 'Reviewed', 'Accepted', 'Rejected'].map((s) => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
