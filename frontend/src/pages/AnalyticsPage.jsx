import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

// ── Hiring Funnel SVG Chart ────────────────────────────────────────────────────
function HiringFunnel({ data }) {
  if (!data || data.length === 0) return null;
  const max = data[0]?.count || 1;
  const COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#06b6d4', '#10b981'];

  return (
    <div className="funnel-chart" id="hiring-funnel-chart">
      <h3 className="funnel-title">🔽 Hiring Funnel</h3>
      <p className="funnel-subtitle">Each stage shows applicants at or beyond that point in the pipeline</p>
      <div className="funnel-bars">
        {data.map((item, i) => {
          const pct = max > 0 ? (item.count / max) * 100 : 0;
          return (
            <div key={item.stage} className="funnel-row">
              <div className="funnel-label">{i + 1}</div>
              <div className="funnel-bar-track">
                <div
                  className="funnel-bar-fill"
                  style={{ width: `${pct}%`, background: COLORS[i] || '#6366f1' }}
                />
              </div>
              <div className="funnel-stage-name">{item.stage}</div>
              <div className="funnel-count">{item.count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Applications Per Job Bar Chart (SVG) ───────────────────────────────────────
function JobBarChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.applications), 1);
  const height = 180;
  const barW = 36;
  const gap = 20;
  const totalW = data.length * (barW + gap);
  const COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#06b6d4', '#10b981'];

  return (
    <div className="chart-wrapper" id="job-bar-chart">
      <h3 className="chart-title">📊 Applications per Job</h3>
      <div style={{ overflowX: 'auto' }}>
        <svg width={Math.max(totalW, 300)} height={height + 60} style={{ display: 'block' }}>
          {/* Y-axis gridlines */}
          {[0, 25, 50, 75, 100].map(pct => (
            <line
              key={pct}
              x1={30} y1={(height * (100 - pct)) / 100}
              x2={totalW + 30} y2={(height * (100 - pct)) / 100}
              stroke="rgba(255,255,255,0.06)" strokeWidth={1}
            />
          ))}
          {data.map((d, i) => {
            const barH = max > 0 ? (d.applications / max) * height : 0;
            const x = 30 + i * (barW + gap);
            const y = height - barH;
            return (
              <g key={d.jobId || i}>
                <rect x={x} y={y} width={barW} height={barH}
                  rx={6} fill={COLORS[i % COLORS.length]} fillOpacity={0.9} />
                <text x={x + barW / 2} y={y - 5} textAnchor="middle"
                  fontSize={11} fill="rgba(255,255,255,0.8)" fontWeight="bold">
                  {d.applications}
                </text>
                <text x={x + barW / 2} y={height + 16} textAnchor="middle"
                  fontSize={10} fill="rgba(255,255,255,0.5)">
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          {data.map((d, i) => (
            <span key={d.jobId || i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
              {i + 1}. {d.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Analytics Page ────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.getAnalytics(token);
        if (res.success) setData(res);
        else setError(res.message || 'Failed to load analytics');
      } catch { setError('Could not connect to server.'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [token]);

  if (loading) return (
    <div className="dashboard-page"><div className="container">
      <div className="loading-wrapper"><div className="spinner" /><span>Loading analytics...</span></div>
    </div></div>
  );

  if (error) return (
    <div className="dashboard-page"><div className="container">
      <div className="alert alert-error">⚠️ {error}</div>
    </div></div>
  );

  const ja = data?.jobAnalytics || {};
  const aa = data?.applicantAnalytics || {};
  const top = data?.topPerformingJob;

  return (
    <div className="dashboard-page">
      <div className="container">

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">📊 Recruitment Analytics</h1>
            <p className="dashboard-subtitle">A summary of your jobs, applicants, and hiring outcomes</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')} id="back-dashboard-btn">← Dashboard</button>
        </div>

        {/* 3-Column Cards */}
        <div className="analytics-cards-grid" id="analytics-cards">

          {/* Job Analytics */}
          <div className="analytics-card" id="job-analytics-card">
            <div className="analytics-card-header">
              <span className="analytics-card-icon">💼</span>
              <h3>Job Analytics</h3>
            </div>
            <div className="analytics-stat-list">
              <div className="analytics-stat-row">
                <span>Total Jobs</span>
                <span className="analytics-stat-val">{ja.totalJobs ?? 0}</span>
              </div>
              <div className="analytics-stat-row">
                <span>Active Jobs</span>
                <span className="analytics-stat-val analytics-val-active">{ja.activeJobs ?? 0}</span>
              </div>
              <div className="analytics-stat-row">
                <span>Closed Jobs</span>
                <span className="analytics-stat-val analytics-val-closed">{ja.closedJobs ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Applicant Analytics */}
          <div className="analytics-card" id="applicant-analytics-card">
            <div className="analytics-card-header">
              <span className="analytics-card-icon">👥</span>
              <h3>Applicant Analytics</h3>
            </div>
            <div className="analytics-stat-list">
              <div className="analytics-stat-row">
                <span>Total Applicants</span>
                <span className="analytics-stat-val">{aa.total ?? 0}</span>
              </div>
              <div className="analytics-stat-row">
                <span>Shortlisted</span>
                <span className="analytics-stat-val analytics-val-shortlisted">{aa.shortlisted ?? 0}</span>
              </div>
              <div className="analytics-stat-row">
                <span>Rejected</span>
                <span className="analytics-stat-val analytics-val-rejected">{aa.rejected ?? 0}</span>
              </div>
              <div className="analytics-stat-row">
                <span>Hired</span>
                <span className="analytics-stat-val analytics-val-hired">{aa.hired ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Top Performing Job */}
          <div className="analytics-card analytics-card-highlight" id="top-performing-job-card">
            <div className="analytics-card-header">
              <span className="analytics-card-icon">🏆</span>
              <h3>Top Performing Job</h3>
            </div>
            {top ? (
              <div className="top-job-body">
                <div className="top-job-title">{top.title}</div>
                <p className="top-job-desc">
                  {top.applicationCount} application{top.applicationCount !== 1 ? 's' : ''} received — highest among all job postings.
                </p>
                <p className="top-job-definition">
                  Definition: the job posting with the highest application count is automatically surfaced here.
                </p>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>No jobs or applications yet.</p>
            )}
          </div>
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Hiring Funnel */}
          <div className="chart-card" style={{ flex: '1 1 340px' }}>
            <HiringFunnel data={data?.funnelData} />
          </div>

          {/* Applications per job bar chart */}
          <div className="chart-card" style={{ flex: '1 1 340px' }}>
            <JobBarChart data={data?.jobPerformance} />
          </div>
        </div>

        {/* Status Breakdown */}
        {aa.total > 0 && (
          <div className="dashboard-section" id="status-breakdown">
            <h2 className="section-heading">Status Breakdown</h2>
            <div className="status-breakdown-grid">
              {[
                { label: 'Applied', count: aa.total, color: '#6366f1' },
                { label: 'Under Review', count: aa.underReview, color: '#8b5cf6' },
                { label: 'Shortlisted', count: aa.shortlisted, color: '#f59e0b' },
                { label: 'Interview Scheduled', count: aa.interviewScheduled, color: '#06b6d4' },
                { label: 'Hired', count: aa.hired, color: '#10b981' },
                { label: 'Rejected', count: aa.rejected, color: '#ef4444' },
              ].map(s => (
                <div key={s.label} className="status-breakdown-card">
                  <div className="breakdown-bar" style={{ background: s.color, width: `${aa.total > 0 ? (s.count / aa.total) * 100 : 0}%` }} />
                  <div className="breakdown-info">
                    <span className="breakdown-label">{s.label}</span>
                    <span className="breakdown-count" style={{ color: s.color }}>{s.count ?? 0}</span>
                  </div>
                  <div className="breakdown-pct">{aa.total > 0 ? Math.round(((s.count ?? 0) / aa.total) * 100) : 0}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
