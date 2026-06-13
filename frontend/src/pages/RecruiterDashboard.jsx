import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const STATUS_COLORS = {
  Applied: 'status-applied',
  'Under Review': 'status-under-review',
  Shortlisted: 'status-shortlisted',
  'Interview Scheduled': 'status-interview-scheduled',
  Rejected: 'status-rejected',
  Hired: 'status-hired',
};

const ALL_STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'];

function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function ActivityIcon({ msg }) {
  if (msg.toLowerCase().includes('created')) return '📋';
  if (msg.toLowerCase().includes('shortlisted')) return '⭐';
  if (msg.toLowerCase().includes('interview')) return '📅';
  if (msg.toLowerCase().includes('closed') || msg.toLowerCase().includes('rejected')) return '🚫';
  if (msg.toLowerCase().includes('hired')) return '🎉';
  if (msg.toLowerCase().includes('note')) return '📝';
  if (msg.toLowerCase().includes('updated')) return '✏️';
  return '🔔';
}

// ── Notes Sidebar ─────────────────────────────────────────────────────────────
function NotesSidebar({ jobId, app, token, onClose, onUpdate }) {
  const [notes, setNotes] = useState(app.notes || []);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    const res = await api.addNote(jobId, app._id, newNote.trim(), token);
    if (res.success) {
      setNotes(res.data);
      setNewNote('');
      onUpdate(app._id, res.data);
    }
    setSaving(false);
  };

  const handleUpdate = async (noteId) => {
    if (!editText.trim()) return;
    const res = await api.updateNote(jobId, app._id, noteId, editText.trim(), token);
    if (res.success) {
      setNotes(res.data);
      setEditId(null);
      onUpdate(app._id, res.data);
    }
  };

  const handleDelete = async (noteId) => {
    const res = await api.deleteNote(jobId, app._id, noteId, token);
    if (res.success) {
      setNotes(res.data);
      onUpdate(app._id, res.data);
    }
  };

  return (
    <div className="notes-sidebar-overlay" onClick={onClose}>
      <div className="notes-sidebar" onClick={e => e.stopPropagation()}>
        <div className="notes-sidebar-header">
          <div>
            <h3>📝 Notes — {app.name}</h3>
            <p className="notes-subtext">Visible only to the recruiter team</p>
          </div>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div className="notes-list">
          {notes.length === 0 && (
            <div className="notes-empty">No notes yet. Add the first one below.</div>
          )}
          {[...notes].reverse().map(note => (
            <div key={note._id} className="note-item">
              {editId === note._id ? (
                <div className="note-edit">
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    className="note-textarea"
                    rows={2}
                  />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button className="btn btn-sm btn-primary" onClick={() => handleUpdate(note._id)}>Save</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="note-text">{note.text}</p>
                  <div className="note-meta">
                    <span>{relativeTime(note.createdAt)}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-xs btn-ghost" onClick={() => { setEditId(note._id); setEditText(note.text); }}>✏️</button>
                      <button className="btn btn-xs btn-danger" onClick={() => handleDelete(note._id)}>🗑</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="notes-add">
          <textarea
            className="note-textarea"
            placeholder="Add a note..."
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            rows={3}
          />
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !newNote.trim()}>
            {saving ? 'Saving...' : '+ Add Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Interview Modal ────────────────────────────────────────────────────────────
function InterviewModal({ jobId, app, token, onClose, onUpdate }) {
  const existing = app.interview;
  const [form, setForm] = useState({
    date: existing?.date || '',
    time: existing?.time || '',
    mode: existing?.mode || 'Online',
    meetingLink: existing?.meetingLink || '',
    location: existing?.location || '',
    remarks: existing?.remarks || '',
  });
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSchedule = async () => {
    if (!form.date || !form.time || !form.mode) return;
    setSaving(true);
    const fn = existing ? api.updateInterview : api.scheduleInterview;
    const res = await fn(jobId, app._id, form, token);
    if (res.success) { onUpdate(app._id, res.data); onClose(); }
    setSaving(false);
  };

  const handleCancel = async () => {
    setCancelling(true);
    const res = await api.cancelInterview(jobId, app._id, token);
    if (res.success) { onUpdate(app._id, res.data); onClose(); }
    setCancelling(false);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10001 }}>
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>📅 {existing ? 'Update' : 'Schedule'} Interview</h2>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
          Applicant: <strong style={{ color: 'var(--text-primary)' }}>{app.name}</strong>
        </p>

        <div className="interview-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Time *</label>
              <input type="time" className="form-input" value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mode *</label>
            <div className="mode-toggle">
              <button
                className={`mode-btn ${form.mode === 'Online' ? 'active' : ''}`}
                onClick={() => set('mode', 'Online')}
                type="button"
              >🌐 Online</button>
              <button
                className={`mode-btn ${form.mode === 'Offline' ? 'active' : ''}`}
                onClick={() => set('mode', 'Offline')}
                type="button"
              >🏢 Offline</button>
            </div>
          </div>

          {form.mode === 'Online' ? (
            <div className="form-group">
              <label className="form-label">Meeting Link</label>
              <input type="url" className="form-input" placeholder="https://meet.google.com/..." value={form.meetingLink} onChange={e => set('meetingLink', e.target.value)} />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" className="form-input" placeholder="Office address or room" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Remarks</label>
            <textarea className="form-input" rows={3} placeholder="e.g. Technical round — DSA focus" value={form.remarks} onChange={e => set('remarks', e.target.value)} />
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '20px' }}>
          {existing && (
            <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? '...' : '🗑 Cancel Interview'}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>Dismiss</button>
          <button
            className="btn btn-primary"
            onClick={handleSchedule}
            disabled={saving || !form.date || !form.time}
          >
            {saving ? 'Saving...' : existing ? '✅ Update' : '📅 Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
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
  const [confirmModal, setConfirmModal] = useState(null);
  const [jobFilter, setJobFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState({});
  const [searchFilter, setSearchFilter] = useState({});
  const [selectedApps, setSelectedApps] = useState({});
  const [notesSidebar, setNotesSidebar] = useState(null); // { jobId, app }
  const [interviewModal, setInterviewModal] = useState(null); // { jobId, app }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard(token);
      if (res.success) setData(res);
      else setError(res.message || 'Failed to load dashboard');
    } catch { setError('Could not connect to server.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const toggleApplications = async (jobId) => {
    if (expandedJob === jobId) { setExpandedJob(null); return; }
    setExpandedJob(jobId);
    if (!jobApplications[jobId]) {
      setLoadingApps(p => ({ ...p, [jobId]: true }));
      try {
        const res = await api.getApplications(jobId, token);
        if (res.success) setJobApplications(p => ({ ...p, [jobId]: res.data }));
      } finally { setLoadingApps(p => ({ ...p, [jobId]: false })); }
    }
  };

  const reloadApplications = async (jobId) => {
    setLoadingApps(p => ({ ...p, [jobId]: true }));
    try {
      const params = {};
      if (statusFilter[jobId] && statusFilter[jobId] !== 'All') params.status = statusFilter[jobId];
      if (searchFilter[jobId]) params.search = searchFilter[jobId];
      const res = await api.getApplications(jobId, token, params);
      if (res.success) setJobApplications(p => ({ ...p, [jobId]: res.data }));
    } finally { setLoadingApps(p => ({ ...p, [jobId]: false })); }
  };

  const handleStatusFilterChange = async (jobId, status) => {
    setStatusFilter(p => ({ ...p, [jobId]: status }));
    setLoadingApps(p => ({ ...p, [jobId]: true }));
    try {
      const params = {};
      if (status !== 'All') params.status = status;
      if (searchFilter[jobId]) params.search = searchFilter[jobId];
      const res = await api.getApplications(jobId, token, params);
      if (res.success) setJobApplications(p => ({ ...p, [jobId]: res.data }));
    } finally { setLoadingApps(p => ({ ...p, [jobId]: false })); }
  };

  const handleSearchChange = useCallback(async (jobId, search) => {
    setSearchFilter(p => ({ ...p, [jobId]: search }));
    const params = {};
    if (statusFilter[jobId] && statusFilter[jobId] !== 'All') params.status = statusFilter[jobId];
    if (search) params.search = search;
    const res = await api.getApplications(jobId, token, params);
    if (res.success) setJobApplications(p => ({ ...p, [jobId]: res.data }));
  }, [statusFilter, token]);

  const updateStatus = async (jobId, appId, status) => {
    const res = await api.updateApplicationStatus(jobId, appId, status, token);
    if (res.locked) {
      // Backend rejected — decision is already final
      showToast(`🔒 ${res.message}`, 'error');
      setConfirmModal(null);
      return;
    }
    if (res.success) {
      if (res.jobAutoDeleted) {
        setData(prev => ({ ...prev, jobs: prev.jobs.filter(j => j._id !== jobId), stats: { ...prev.stats, totalJobsPosted: Math.max(0, (prev.stats?.totalJobsPosted ?? 1) - 1) } }));
        setExpandedJob(null);
        showToast('🎉 All openings filled! Job has been automatically closed.');
      } else {
        setJobApplications(prev => ({ ...prev, [jobId]: (prev[jobId] || []).map(a => a._id === appId ? { ...a, status } : a) }));
        // Refresh dashboard stats
        const dashRes = await api.getDashboard(token);
        if (dashRes.success) setData(dashRes);
      }
    }
  };

  const handleStatusChange = (jobId, appId, newStatus, appName) => {
    if (newStatus === 'Hired' || newStatus === 'Rejected') {
      setConfirmModal({ jobId, appId, status: newStatus, appName });
    } else {
      updateStatus(jobId, appId, newStatus);
    }
  };

  const confirmStatusChange = () => {
    if (confirmModal) { updateStatus(confirmModal.jobId, confirmModal.appId, confirmModal.status); setConfirmModal(null); }
  };

  const handleToggleJobStatus = async (jobId) => {
    const res = await api.toggleJobStatus(jobId, token);
    if (res.success) {
      setData(prev => ({ ...prev, jobs: prev.jobs.map(j => j._id === jobId ? { ...j, status: res.data.status } : j) }));
      const dashRes = await api.getDashboard(token);
      if (dashRes.success) setData(dashRes);
      showToast(`Job is now ${res.data.status === 'Open' ? '✅ Open' : '🔴 Closed'}`);
    }
  };

  const handleExportCSV = async (jobId) => {
    try {
      const { blob, filename } = await api.exportApplicants(jobId, token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      showToast('📥 CSV exported successfully');
    } catch { showToast('Failed to export CSV', 'error'); }
  };

  const toggleSelectApp = (jobId, appId) => {
    setSelectedApps(prev => {
      const current = new Set(prev[jobId] || []);
      if (current.has(appId)) current.delete(appId); else current.add(appId);
      return { ...prev, [jobId]: current };
    });
  };

  const handleBulkAction = async (jobId, status) => {
    const appIds = [...(selectedApps[jobId] || [])];
    if (!appIds.length) return;
    const res = await api.bulkUpdateStatus(jobId, appIds, status, token);
    if (res.success) {
      const msg = res.skipped > 0
        ? `✅ ${res.updated} updated. 🔒 ${res.skipped} skipped (already Hired/Rejected).`
        : `✅ ${res.updated} applicant${res.updated !== 1 ? 's' : ''} updated to ${status}`;
      showToast(msg, res.skipped > 0 ? 'error' : 'success');
      setSelectedApps(prev => ({ ...prev, [jobId]: new Set() }));
      await reloadApplications(jobId);
      const dashRes = await api.getDashboard(token);
      if (dashRes.success) setData(dashRes);
    }
  };

  const handleNotesUpdate = (appId, updatedNotes) => {
    if (notesSidebar) {
      setJobApplications(prev => {
        const updated = { ...prev };
        if (updated[notesSidebar.jobId]) {
          updated[notesSidebar.jobId] = updated[notesSidebar.jobId].map(a =>
            a._id === appId ? { ...a, notes: updatedNotes } : a
          );
        }
        return updated;
      });
      setNotesSidebar(prev => prev ? { ...prev, app: { ...prev.app, notes: updatedNotes } } : null);
    }
  };

  const handleInterviewUpdate = (appId, updatedApp) => {
    if (interviewModal) {
      setJobApplications(prev => {
        const updated = { ...prev };
        if (updated[interviewModal.jobId]) {
          updated[interviewModal.jobId] = updated[interviewModal.jobId].map(a =>
            a._id === appId ? updatedApp : a
          );
        }
        return updated;
      });
      const dashRes = api.getDashboard(token).then(r => { if (r.success) setData(r); });
    }
  };

  const filteredJobs = data?.jobs?.filter(j =>
    jobFilter === 'All' ? true : j.status === jobFilter
  ) || [];

  if (loading) return (
    <div className="dashboard-page"><div className="container">
      <div className="loading-wrapper"><div className="spinner" /><span>Loading your dashboard...</span></div>
    </div></div>
  );

  if (error) return (
    <div className="dashboard-page"><div className="container">
      <div className="alert alert-error">⚠️ {error}</div>
    </div></div>
  );

  return (
    <>
      {/* Notes Sidebar */}
      {notesSidebar && (
        <NotesSidebar
          jobId={notesSidebar.jobId}
          app={notesSidebar.app}
          token={token}
          onClose={() => setNotesSidebar(null)}
          onUpdate={handleNotesUpdate}
        />
      )}

      {/* Interview Modal */}
      {interviewModal && (
        <InterviewModal
          jobId={interviewModal.jobId}
          app={interviewModal.app}
          token={token}
          onClose={() => setInterviewModal(null)}
          onUpdate={handleInterviewUpdate}
        />
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-icon">{confirmModal.status === 'Hired' ? '🎉' : '❌'}</div>
            <h2 style={{ marginBottom: '8px' }}>{confirmModal.status === 'Hired' ? 'Mark as Hired?' : 'Reject Applicant?'}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
              You are about to mark <strong style={{ color: 'var(--text-primary)' }}>{confirmModal.appName}</strong> as <strong>{confirmModal.status}</strong>.
            </p>
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              ⚠️ <strong>This action is permanent.</strong> The decision <strong>cannot be changed or undone</strong>.
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmModal(null)} id="cancel-status-btn">Cancel</button>
              <button className={`btn ${confirmModal.status === 'Hired' ? 'btn-success' : 'btn-danger'}`} onClick={confirmStatusChange} id="confirm-status-btn">
                {confirmModal.status === 'Hired' ? '🎉 Yes, Hire' : '❌ Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-page">
        <div className="container">

          {/* Toast */}
          {toast && (
            <div className={`dashboard-toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
              <span>{toast.msg}</span>
              <button onClick={() => setToast(null)}>✕</button>
            </div>
          )}

          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">👋 Welcome, <span>{user?.name}</span></h1>
              <p className="dashboard-subtitle">Recruiter Dashboard — manage your hiring pipeline</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/analytics')} id="analytics-btn">📊 Analytics</button>
              <button className="btn btn-primary" onClick={() => navigate('/jobs/create')} id="post-job-btn">+ Post New Job</button>
            </div>
          </div>

          {/* Stats — 5 cards */}
          <div className="stats-grid stats-grid-5" id="recruiter-stats">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-value">{data?.stats?.totalJobsPosted ?? 0}</div>
              <div className="stat-label">Total Jobs Posted</div>
            </div>
            <div className="stat-card stat-card-active">
              <div className="stat-icon">🟢</div>
              <div className="stat-value">{data?.stats?.activeJobs ?? 0}</div>
              <div className="stat-label">Active Jobs</div>
            </div>
            <div className="stat-card stat-card-closed">
              <div className="stat-icon">🔴</div>
              <div className="stat-value">{data?.stats?.closedJobs ?? 0}</div>
              <div className="stat-label">Closed Jobs</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{data?.stats?.totalApplicationsReceived ?? 0}</div>
              <div className="stat-label">Total Applications</div>
            </div>
            <div className="stat-card stat-card-shortlisted">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{data?.stats?.shortlistedCount ?? 0}</div>
              <div className="stat-label">Shortlisted</div>
            </div>
          </div>

          {/* Job Filter Bar */}
          <div className="filter-chips-row" id="job-filter-bar">
            {['All', 'Open', 'Closed'].map(f => (
              <button
                key={f}
                className={`filter-chip ${jobFilter === f ? 'filter-chip-active' : ''}`}
                onClick={() => setJobFilter(f)}
                id={`job-filter-${f.toLowerCase()}`}
              >{f} Jobs</button>
            ))}
          </div>

          {/* Jobs List */}
          <div className="dashboard-section">
            <h2 className="section-heading">Your Job Postings</h2>

            {filteredJobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No jobs found</h3>
                <p>{jobFilter !== 'All' ? `No ${jobFilter} jobs.` : 'Click "Post New Job" to get started'}</p>
              </div>
            ) : (
              <div className="recruiter-jobs" id="recruiter-jobs-list">
                {filteredJobs.map(job => {
                  const appList = jobApplications[job._id] || [];
                  const selected = selectedApps[job._id] || new Set();

                  return (
                    <div key={job._id} className="recruiter-job-card">
                      <div className="recruiter-job-header">
                        <div className="recruiter-job-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h3>{job.title}</h3>
                            <span className={`job-status-badge ${job.status === 'Open' ? 'badge-open' : 'badge-closed'}`}>
                              {job.status}
                            </span>
                          </div>
                          <div className="recruiter-job-meta">
                            <span className={`type-badge type-${job.type?.toLowerCase().replace(/[\s-]/g, '')}`}>{job.type}</span>
                            <span>📍 {job.location}</span>
                            <span>🏢 {job.company}</span>
                            {job.openings
                              ? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>🎯 {job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                              : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>🤷 Openings: not set</span>
                            }
                          </div>
                        </div>
                        <div className="recruiter-job-actions">
                          <span className="app-count-badge">{job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}</span>
                          <button
                            className={`btn btn-sm ${job.status === 'Open' ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleJobStatus(job._id)}
                            id={`toggle-status-${job._id}`}
                          >
                            {job.status === 'Open' ? '🔴 Close' : '✅ Reopen'}
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/jobs/${job._id}/edit`)} id={`edit-job-${job._id}`}>✏️ Edit</button>
                          <button
                            className={`btn btn-sm ${expandedJob === job._id ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => toggleApplications(job._id)}
                            id={`view-apps-${job._id}`}
                          >
                            {expandedJob === job._id ? '▲ Hide' : '👁 Applicants'}
                          </button>
                        </div>
                      </div>

                      {expandedJob === job._id && (
                        <div className="applications-panel" id={`apps-panel-${job._id}`}>
                          {/* Panel Header */}
                          <div className="apps-panel-header">
                            <h4>📋 Applications for <em>{job.title}</em></h4>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn btn-sm btn-ghost" onClick={() => handleExportCSV(job._id)} id={`export-${job._id}`}>📥 Export CSV</button>
                              <button className="btn btn-sm btn-ghost" onClick={() => navigate(`/jobs/${job._id}`)}>🔗 View Job</button>
                            </div>
                          </div>

                          {/* Search + Filter */}
                          <div className="apps-controls">
                            <input
                              type="text"
                              className="search-input"
                              placeholder="🔍 Search by name or email..."
                              value={searchFilter[job._id] || ''}
                              onChange={e => handleSearchChange(job._id, e.target.value)}
                              id={`search-${job._id}`}
                            />
                            <div className="filter-chips-row filter-chips-sm">
                              {['All', ...ALL_STATUSES].map(s => (
                                <button
                                  key={s}
                                  className={`filter-chip filter-chip-sm ${(statusFilter[job._id] || 'All') === s ? 'filter-chip-active' : ''}`}
                                  onClick={() => handleStatusFilterChange(job._id, s)}
                                >{s}</button>
                              ))}
                            </div>
                          </div>

                          {/* Bulk Action Bar */}
                          {selected.size > 0 && (
                            <div className="bulk-action-bar" id={`bulk-bar-${job._id}`}>
                              <span>{selected.size} selected</span>
                              <button className="btn btn-sm btn-secondary" onClick={() => handleBulkAction(job._id, 'Under Review')}>Under Review</button>
                              <button className="btn btn-sm" style={{ background: 'var(--shortlisted)', color: '#fff' }} onClick={() => handleBulkAction(job._id, 'Shortlisted')}>⭐ Shortlist</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleBulkAction(job._id, 'Rejected')}>Reject</button>
                              <button className="btn btn-sm btn-ghost" onClick={() => setSelectedApps(p => ({ ...p, [job._id]: new Set() }))}>Clear</button>
                            </div>
                          )}

                          {/* Table */}
                          {loadingApps[job._id] ? (
                            <div className="loading-wrapper"><div className="spinner" /><span>Loading...</span></div>
                          ) : !appList || appList.length === 0 ? (
                            <div className="alert alert-info">No applications match the current filter.</div>
                          ) : (
                            <div style={{ overflowX: 'auto' }}>
                              <table className="applications-table">
                                <thead>
                                  <tr>
                                    <th><input type="checkbox" onChange={e => {
                                      const all = new Set(e.target.checked ? appList.map(a => a._id) : []);
                                      setSelectedApps(p => ({ ...p, [job._id]: all }));
                                    }} checked={selected.size === appList.length && appList.length > 0} /></th>
                                    <th>Applicant</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Applied</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {appList.map(app => (
                                    <tr key={app._id} className={selected.has(app._id) ? 'row-selected' : ''}>
                                      <td><input type="checkbox" checked={selected.has(app._id)} onChange={() => toggleSelectApp(job._id, app._id)} /></td>
                                      <td>
                                        <strong>{app.name}</strong>
                                        {app.notes?.length > 0 && <span className="note-count-badge">{app.notes.length} note{app.notes.length > 1 ? 's' : ''}</span>}
                                        {app.interview && <span className="interview-badge">📅 Interview</span>}
                                      </td>
                                      <td>{app.email}</td>
                                      <td>{app.phone}</td>
                                      <td>{new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                      <td>
                                        {app.status === 'Hired' || app.status === 'Rejected' ? (
                                          <span className={`status-badge ${STATUS_COLORS[app.status]}`} title="Decision is final">🔒 {app.status}</span>
                                        ) : (
                                          <select
                                            className={`status-select ${STATUS_COLORS[app.status]}`}
                                            value={app.status}
                                            onChange={e => handleStatusChange(job._id, app._id, e.target.value, app.name)}
                                            id={`status-${app._id}`}
                                          >
                                            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                          </select>
                                        )}
                                      </td>
                                      <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                          <button
                                            className="btn btn-xs btn-ghost"
                                            onClick={() => setNotesSidebar({ jobId: job._id, app })}
                                            id={`notes-${app._id}`}
                                            title="Recruiter Notes"
                                          >📝</button>
                                          <button
                                            className="btn btn-xs btn-ghost"
                                            onClick={() => setInterviewModal({ jobId: job._id, app })}
                                            id={`interview-${app._id}`}
                                            title="Schedule Interview"
                                          >📅</button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity Feed */}
          {data?.recentActivity?.length > 0 && (
            <div className="dashboard-section" id="activity-feed-section">
              <h2 className="section-heading">🕐 Recent Activity</h2>
              <div className="activity-feed">
                {data.recentActivity.map(entry => (
                  <div key={entry._id} className="activity-item">
                    <span className="activity-icon"><ActivityIcon msg={entry.message} /></span>
                    <span className="activity-message">{entry.message}</span>
                    <span className="activity-time">{relativeTime(entry.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
