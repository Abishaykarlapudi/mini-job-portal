import { useNavigate } from 'react-router-dom';

const TYPE_CLASS = {
  'Full-time': 'type-full-time',
  'Part-time': 'type-part-time',
  'Remote': 'type-remote',
  'Internship': 'type-internship',
  'Contract': 'type-contract',
};

function getInitials(company) {
  return company ? company.charAt(0).toUpperCase() : '?';
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  if (days < 60) return '1 month ago';
  return `${Math.floor(days / 30)} months ago`;
}

export default function JobCard({ job }) {
  const navigate = useNavigate();

  return (
    <div
      className="job-card"
      onClick={() => navigate(`/jobs/${job._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/jobs/${job._id}`)}
      id={`job-card-${job._id}`}
    >
      <div className="card-header">
        <div className="company-logo">
          {job.logoUrl ? (
            <img src={job.logoUrl} alt={job.company} onError={e => { e.target.style.display = 'none'; }} />
          ) : (
            getInitials(job.company)
          )}
        </div>

        <div className="card-title-area">
          <div className="card-job-title">{job.title}</div>
          <div className="card-company">{job.company}</div>
        </div>

        <span className={`type-badge ${TYPE_CLASS[job.type] || 'type-full-time'}`}>
          {job.type}
        </span>
      </div>

      <div className="card-meta">
        <span className="meta-item">
          <span className="meta-icon">📍</span> {job.location}
        </span>
        <span className="meta-item">
          <span className="meta-icon">💼</span> {job.type}
        </span>
      </div>

      <div className="card-salary">
        {job.salary && job.salary !== 'Not specified' ? `💰 ${job.salary}` : '💰 Salary not disclosed'}
      </div>

      <div className="card-footer">
        <span className="card-date">🕒 {timeAgo(job.createdAt)}</span>
        <button className="btn-view" onClick={e => { e.stopPropagation(); navigate(`/jobs/${job._id}`); }}>
          View Details →
        </button>
      </div>
    </div>
  );
}
