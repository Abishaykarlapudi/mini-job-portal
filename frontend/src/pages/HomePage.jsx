import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import JobCard from '../components/JobCard';
import Pagination from '../components/Pagination';

const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Remote', 'Internship', 'Contract'];

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [type, setType] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 6, sort };
      if (search) params.search = search;
      if (type !== 'All') params.type = type;
      const data = await api.getJobs(params);
      if (data.success) {
        setJobs(data.data);
        setTotalPages(data.pages);
        setTotal(data.total);
      } else {
        setError('Failed to load jobs');
      }
    } catch {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [page, search, type, sort]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = e => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleTypeChange = t => {
    setType(t);
    setPage(1);
  };

  const handleSortChange = e => {
    setSort(e.target.value);
    setPage(1);
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🚀 1000+ Jobs Available</div>
          <h1>
            Find Your <span>Dream Job</span><br />Today
          </h1>
          <p>Discover opportunities from top companies. Your next career move starts here.</p>

          <form className="search-bar" onSubmit={handleSearch} id="search-form">
            <input
              id="search-input"
              type="text"
              placeholder="Search by title, company, or location..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn-search" id="search-btn">
              🔍 Search
            </button>
          </form>

          <div className="hero-stats">
            <div className="hero-stat"><strong>{total}</strong> Open Positions</div>
            <div className="hero-stat"><strong>500+</strong> Companies</div>
            <div className="hero-stat"><strong>50K+</strong> Job Seekers</div>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="filter-inner">
          <span className="filter-label">Filter:</span>

          {/* Desktop: chip buttons */}
          <div className="type-chips desktop-chips">
            {JOB_TYPES.map(t => (
              <button
                key={t}
                className={`chip ${type === t ? 'active' : ''}`}
                onClick={() => handleTypeChange(t)}
                id={`filter-${t.toLowerCase().replace('-', '')}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Mobile: dropdown select */}
          <select
            className="sort-select mobile-filter-select"
            value={type}
            onChange={e => handleTypeChange(e.target.value)}
            id="mobile-type-select"
          >
            {JOB_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            id="sort-select"
            className="sort-select"
            value={sort}
            onChange={handleSortChange}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="salary_asc">Salary: Low to High</option>
            <option value="salary_desc">Salary: High to Low</option>
          </select>
        </div>
      </div>

      {/* JOB LISTINGS */}
      <div className="container">
        <div className="jobs-section">
          <div className="section-header">
            <h2 className="section-title">
              {search ? `Results for "${search}"` : type === 'All' ? 'All Jobs' : `${type} Jobs`}
            </h2>
            <span className="section-count">
              {total} {total === 1 ? 'job' : 'jobs'} found
            </span>
          </div>

          {loading && (
            <div className="loading-wrapper">
              <div className="spinner" />
              <span>Loading jobs...</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error" id="jobs-error">
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="empty-state" id="no-jobs">
              <div className="empty-icon">🔍</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <>
              <div className="jobs-grid" id="jobs-grid">
                {jobs.map(job => <JobCard key={job._id} job={job} />)}
              </div>
              <Pagination
                page={page}
                pages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
