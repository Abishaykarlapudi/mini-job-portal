import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
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
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showApps, setShowApps] = useState(false);

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
    try {
      const data = await api.getApplications(id);
      if (data.success) setApplications(data.data);
    } catch { /* silently fail */ }
  };

  useEffect(() => {
    fetchJob();
    fetchApplications();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const data = await api.deleteJob(id);
      if (data.success) navigate('/');
    } catch {
      setDeleting(false);
    }
  };

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

              {/* Admin Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
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
              </div>

              {/* Applications List (toggled) */}
              {showApps && (
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
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="apply-sidebar">
            <div className="apply-card">
              <h3>Apply for this Role</h3>
              <p className="subtitle">Fill in your details and we'll get back to you.</p>
              <ApplicationForm jobId={id} onSuccess={fetchApplications} />
            </div>

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
