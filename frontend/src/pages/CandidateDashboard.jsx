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

export default function CandidateDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('applications');
  const [unsaving, setUnsaving] = useState(null);

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

  const handleUnsave = async (jobId) => {
    setUnsaving(jobId);
    try {
      const res = await api.unsaveJob(jobId, token);
      if (res.success) {
        setData((prev) => ({
          ...prev,
          savedJobs: prev.savedJobs.filter((s) => s.jobId?._id !== jobId),
          stats: {
            ...prev.stats,
            totalSavedJobs: prev.stats.totalSavedJobs - 1,
          },
        }));
      }
    } finally {
      setUnsaving(null);
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
              👋 Hey, <span>{user?.name}</span>
            </h1>
            <p className="dashboard-subtitle">Candidate Dashboard — track your job hunt</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            id="browse-jobs-btn"
          >
            🔍 Browse Jobs
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid" id="candidate-stats">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-value">{data?.stats?.totalApplications ?? 0}</div>
            <div className="stat-label">Applications Sent</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔖</div>
            <div className="stat-value">{data?.stats?.totalSavedJobs ?? 0}</div>
            <div className="stat-label">Saved Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">
              {data?.applications?.filter((a) => a.status === 'Accepted').length ?? 0}
            </div>
            <div className="stat-label">Accepted</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs" id="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
            id="tab-applications"
          >
            📝 My Applications ({data?.stats?.totalApplications ?? 0})
          </button>
          <button
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
            id="tab-saved"
          >
            🔖 Saved Jobs ({data?.stats?.totalSavedJobs ?? 0})
          </button>
        </div>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="dashboard-section" id="applications-panel">
            {!data?.applications || data.applications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No applications yet</h3>
                <p>
                  Browse jobs and apply to get started!{' '}
                  <button className="link-btn" onClick={() => navigate('/')}>
                    Find jobs →
                  </button>
                </p>
              </div>
            ) : (
              <div className="application-cards" id="application-cards">
                {data.applications.map((app) => {
                  const job = app.jobId;
                  return (
                    <div key={app._id} className="application-card">
                      <div className="application-card-left">
                        <div className="app-job-title">{job?.title || 'Job Deleted'}</div>
                        <div className="app-job-meta">
                          <span>🏢 {job?.company}</span>
                          <span>📍 {job?.location}</span>
                          {job?.type && (
                            <span className={`type-badge type-${job.type.toLowerCase().replace('-', '')}`}>
                              {job.type}
                            </span>
                          )}
                        </div>
                        <div className="app-date">
                          Applied on {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="application-card-right">
                        <span className={`status-badge ${STATUS_COLORS[app.status]}`}>
                          {app.status}
                        </span>
                        {job?._id && (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => navigate(`/jobs/${job._id}`)}
                          >
                            View Job
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Saved Jobs Tab */}
        {activeTab === 'saved' && (
          <div className="dashboard-section" id="saved-jobs-panel">
            {!data?.savedJobs || data.savedJobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔖</div>
                <h3>No saved jobs</h3>
                <p>
                  Bookmark jobs you're interested in.{' '}
                  <button className="link-btn" onClick={() => navigate('/')}>
                    Browse jobs →
                  </button>
                </p>
              </div>
            ) : (
              <div className="saved-job-cards" id="saved-job-cards">
                {data.savedJobs.map((saved) => {
                  const job = saved.jobId;
                  return (
                    <div key={saved._id} className="saved-job-card">
                      <div className="saved-job-logo">
                        {job?.logoUrl ? (
                          <img src={job.logoUrl} alt={job?.company} onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          job?.company?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="saved-job-info">
                        <div className="saved-job-title">{job?.title || 'Job Deleted'}</div>
                        <div className="saved-job-meta">
                          <span>🏢 {job?.company}</span>
                          <span>📍 {job?.location}</span>
                          {job?.salary && job.salary !== 'Not specified' && (
                            <span>💰 {job.salary}</span>
                          )}
                        </div>
                      </div>
                      <div className="saved-job-actions">
                        {job?._id && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => navigate(`/jobs/${job._id}`)}
                          >
                            Apply Now
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleUnsave(job?._id)}
                          disabled={unsaving === job?._id}
                          id={`unsave-${job?._id}`}
                        >
                          {unsaving === job?._id ? '...' : '🗑️ Remove'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
