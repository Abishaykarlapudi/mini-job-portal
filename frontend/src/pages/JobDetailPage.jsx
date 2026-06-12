import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import ApplicationForm from '../components/ApplicationForm';

const TYPE_CLASS = {
  'Full-time': 'type-full-time',
  'Part-time': 'type-part-time',
  'Remote': 'type-remote',
  'Internship': 'type-internship',
  'Contract': 'type-contract',
};

function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, isRecruiter, isCandidate } = useAuth();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [savedJobId, setSavedJobId] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const data = await api.getJob(id);
      if (data.success) setJob(data.data);
      else setError('Job not found');
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!isRecruiter || !token) return;
    try {
      const data = await api.getApplications(id, token);
      if (data.success) setApplications(data.data);
    } catch { /* silently fail */ }
  };

  // Check if this job is saved by the current candidate
  const checkSavedStatus = async () => {
    if (!isCandidate || !token) return;
    try {
      const res = await api.getSavedJobs(token);
      if (res.success) {
        const match = res.data.find((s) => s.jobId?._id === id || s.jobId === id);
        if (match) {
          setSaved(true);
          setSavedJobId(match._id);
        }
      }
    } catch { /* ignore */ }
  };

  // Check if the current candidate already applied to this job
  const checkAppliedStatus = async () => {
    if (!isCandidate || !token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${id}/applied`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.hasApplied) setHasApplied(true);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchJob();
    fetchApplications();
    checkSavedStatus();
    checkAppliedStatus();
  }, [id, token]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const data = await api.deleteJob(id, token);
      if (data.success) navigate('/');
    } catch {
      setDeleting(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setSavingJob(true);
    try {
      if (saved) {
        await api.unsaveJob(id, token);
        setSaved(false);
      } else {
        const res = await api.saveJob(id, token);
        if (res.success) {
          setSaved(true);
        }
      }
    } finally {
      setSavingJob(false);
    }
  };

  // Ownership check: recruiter can edit/delete only their own jobs
  const isOwner = isRecruiter && job?.postedBy && (
    job.postedBy._id === user?.id || job.postedBy === user?.id
  );
  // Allow legacy jobs (no postedBy) to be managed by any recruiter
  const canManage = isRecruiter && (!job?.postedBy || isOwner);

  if (loading) {
    return (
      <div className="job-detail-page">
        <div className="container">
          <div className="loading-wrapper"><div className="spinner" /><span>Loading job details...</span></div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-detail-page">
        <div className="container">
          <div className="alert alert-error">⚠️ {error || 'Job not found'}</div>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>← Back to Jobs</button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')} id="back-btn">
          ← Back to Jobs
        </button>

        <div className="job-detail-layout">
          {/* MAIN CONTENT */}
          <div className="job-detail-main">
            {/* Hero */}
            <div className="job-detail-hero">
              <div className="job-detail-hero-content">
                <div className="job-detail-header">
                  <div className="job-detail-logo">
                    {job.logoUrl ? (
                      <img src={job.logoUrl} alt={job.company} onError={e => { e.target.style.display = 'none'; }} />
                    ) : getInitials(job.company)}
                  </div>
                  <div>
                    <h1 className="job-detail-title" id="job-title">{job.title}</h1>
                    <p className="job-detail-company">{job.company}</p>
                    {job.postedBy?.name && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Posted by {job.postedBy.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="job-detail-chips">
                  <span className={`type-badge ${TYPE_CLASS[job.type] || 'type-full-time'}`}>{job.type}</span>
                  <span className="detail-chip">📍 {job.location}</span>
                  {job.salary && job.salary !== 'Not specified' && (
                    <span className="detail-chip salary-highlight">💰 {job.salary}</span>
                  )}
                  <span className="detail-chip">📅 {formatDate(job.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="job-detail-body">
              <div className="section-heading">Job Description</div>
              <p className="job-description" id="job-description">{job.description}</p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
                {/* Candidate: Save Job */}
                {isCandidate && (
                  <button
                    className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={handleSaveToggle}
                    disabled={savingJob}
                    id="save-job-btn"
                  >
                    {savingJob ? '...' : saved ? '🔖 Saved' : '🔖 Save Job'}
                  </button>
                )}

                {/* Recruiter: manage own jobs */}
                {canManage && (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/jobs/${id}/edit`)}
                      id="edit-job-btn"
                    >
                      ✏️ Edit Job
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => setDeleteModal(true)}
                      id="delete-job-btn"
                    >
                      🗑️ Delete Job
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => { setShowApps(s => !s); fetchApplications(); }}
                      id="view-applications-btn"
                    >
                      👥 Applications ({applications.length})
                    </button>
                  </>
                )}

                {/* Not logged in: prompt to login */}
                {!user && (
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/login')}
                    id="login-to-apply-btn"
                  >
                    🔐 Sign In to Apply
                  </button>
                )}
              </div>

              {/* Applications List (recruiter toggled) */}
              {showApps && canManage && (
                <div style={{ marginTop: '24px' }}>
                  <div className="section-heading">Applications Received</div>
                  {applications.length === 0 ? (
                    <div className="alert alert-info">No applications yet for this job.</div>
                  ) : (
                    applications.map(app => (
                      <div key={app._id} className="applicant-item">
                        <div className="applicant-name">👤 {app.name}</div>
                        <div className="applicant-info">📧 {app.email} &nbsp; 📞 {app.phone}</div>
                        <div className="applicant-info">🕒 Applied {formatDate(app.createdAt)}</div>
                        <div className="applicant-info">
                          Status: <span className={`status-badge status-${app.status?.toLowerCase()}`}>{app.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="apply-sidebar">
            {/* Apply Card — only for candidates */}
            {isCandidate ? (
              <div className="apply-card">
                <h3>Apply for this Role</h3>
                <p className="subtitle">Fill in your details and we'll get back to you.</p>
                <ApplicationForm jobId={id} onSuccess={() => { fetchApplications(); setHasApplied(true); }} hasApplied={hasApplied} />
              </div>
            ) : !user ? (
              <div className="apply-card">
                <h3>Interested in this job?</h3>
                <p className="subtitle">Sign in or create a candidate account to apply.</p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={() => navigate('/login')}
                >
                  🔐 Sign In to Apply
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={() => navigate('/register')}
                >
                  ✨ Create Account
                </button>
              </div>
            ) : null}

            {/* Quick Info Card */}
            <div className="apply-card">
              <h3>Job Overview</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                {[
                  { icon: '💼', label: 'Type', value: job.type },
                  { icon: '📍', label: 'Location', value: job.location },
                  { icon: '🏢', label: 'Company', value: job.company },
                  { icon: '💰', label: 'Salary', value: job.salary || 'Not specified' },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{icon} {label}</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="modal-overlay" id="delete-modal">
          <div className="modal">
            <div className="modal-icon">⚠️</div>
            <h2>Delete Job Posting?</h2>
            <p>
              Are you sure you want to delete <strong>{job.title}</strong> at <strong>{job.company}</strong>?
              This action cannot be undone and will also remove all applications.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteModal(false)}
                disabled={deleting}
                id="cancel-delete-btn"
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
                id="confirm-delete-btn"
              >
                {deleting ? '⏳ Deleting...' : '🗑️ Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
