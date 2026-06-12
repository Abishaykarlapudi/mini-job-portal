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
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { jobId, appId, status, appName }

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
      if (res.jobAutoDeleted) {
        setData(prev => ({
          ...prev,
          jobs: prev.jobs.filter(j => j._id !== jobId),
          stats: {
            ...prev.stats,
            totalJobsPosted: Math.max(0, (prev.stats?.totalJobsPosted ?? 1) - 1),
          },
        }));
        setExpandedJob(null);
        setToast({ type: 'success', msg: '🎉 All openings filled! Job has been automatically closed and removed.' });
        setTimeout(() => setToast(null), 5000);
      } else {
        setJobApplications((prev) => ({
          ...prev,
          [jobId]: prev[jobId].map((a) => (a._id === appId ? { ...a, status } : a)),
        }));
      }
    }
  };

  // Called when recruiter selects a new status from dropdown
  const handleStatusChange = (jobId, appId, newStatus, appName) => {
    if (newStatus === 'Accepted' || newStatus === 'Rejected') {
      // Show confirmation modal before making final decision
      setConfirmModal({ jobId, appId, status: newStatus, appName });
    } else {
      // Pending / Reviewed — no confirmation needed
      updateStatus(jobId, appId, newStatus);
    }
  };

  const confirmStatusChange = () => {
    if (confirmModal) {
      updateStatus(confirmModal.jobId, confirmModal.appId, confirmModal.status);
      setConfirmModal(null);
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
    <>
      {/* Confirmation Modal */}
      {confirmModal ? (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-icon">{confirmModal.status === 'Accepted' ? '✅' : '❌'}</div>
            <h2 style={{ marginBottom: '8px' }}>
              {confirmModal.status === 'Accepted' ? 'Accept Applicant?' : 'Reject Applicant?'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
              You are about to{' '}
              <strong>{confirmModal.status === 'Accepted' ? 'accept' : 'reject'}</strong>{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{confirmModal.appName}</strong>.
            </p>
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}>
              ⚠️ <strong>This action is permanent.</strong> Once you{' '}
              {confirmModal.status === 'Accepted' ? 'accept' : 'reject'} this applicant, the decision{' '}
              <strong>cannot be changed or undone</strong>.
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmModal(null)}
                id="cancel-status-btn"
              >
                Cancel
              </button>
              <button
                className={`btn ${confirmModal.status === 'Accepted' ? 'btn-success' : 'btn-danger'}`}
                onClick={confirmStatusChange}
                id="confirm-status-btn"
              >
                {confirmModal.status === 'Accepted' ? '✅ Yes, Accept' : '❌ Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="dashboard-page">
        <div className="container">
        {/* Toast Notification */}
        {toast && (
          <div style={{
            position: 'fixed', top: '80px', right: '24px', zIndex: 9999,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', borderRadius: '12px', padding: '14px 20px',
            boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
            fontWeight: '600', fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', gap: '10px',
            animation: 'slideIn 0.3s ease',
            maxWidth: '380px',
          }}>
            <span style={{ fontSize: '1.2rem' }}>🎉</span>
            <span>{toast.msg}</span>
            <button onClick={() => setToast(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          </div>
        )}

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
                        {job.openings
                          ? <span style={{ color: 'var(--accent, #6366f1)', fontWeight: 600 }}>🎯 {job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                          : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>🤷 Openings: not set</span>
                        }
                      </div>
                    </div>
                    <div className="recruiter-job-actions">
                      <span className="app-count-badge">
                        {job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}
                      </span>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/jobs/${job._id}/edit`)}
                        id={`edit-job-${job._id}`}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className={`btn btn-sm ${expandedJob === job._id ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => toggleApplications(job._id)}
                        id={`view-apps-${job._id}`}
                      >
                        {expandedJob === job._id ? '▲ Hide Applications' : '👁 View Applications'}
                      </button>
                    </div>
                  </div>

                  {expandedJob === job._id && (
                    <div className="applications-panel" id={`apps-panel-${job._id}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          📋 Applications for <em>{job.title}</em>
                        </h4>
                        <button
                          className="btn btn-sm btn-ghost"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => navigate(`/jobs/${job._id}`)}
                        >
                          🔗 Open Job Page
                        </button>
                      </div>

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
                              <th>Change Status</th>
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
                                  {['Accepted', 'Rejected'].includes(app.status) ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span
                                        className={`status-select ${STATUS_COLORS[app.status]}`}
                                        style={{
                                          display: 'inline-block',
                                          padding: '4px 10px',
                                          borderRadius: '6px',
                                          fontWeight: 600,
                                          fontSize: '0.82rem',
                                          cursor: 'not-allowed',
                                          opacity: 0.85,
                                        }}
                                        title={`Decision is final — cannot be changed`}
                                      >
                                        🔒 {app.status}
                                      </span>
                                    </div>
                                  ) : (
                                    <select
                                      className={`status-select ${STATUS_COLORS[app.status]}`}
                                      value={app.status}
                                      onChange={(e) => handleStatusChange(job._id, app._id, e.target.value, app.name)}
                                      id={`status-${app._id}`}
                                    >
                                      {['Pending', 'Reviewed', 'Accepted', 'Rejected'].map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                      ))}
                                    </select>
                                  )}
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
    </>
  );
}
