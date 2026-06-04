import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import JobForm from '../components/JobForm';

export default function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await api.getJob(id);
        if (data.success) setJob(data.data);
        else setError('Job not found');
      } catch {
        setError('Could not load job details');
      } finally {
        setFetching(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.updateJob(id, formData);
      if (data.success) {
        navigate(`/jobs/${id}`);
      } else {
        setError(data.message || 'Failed to update job');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="form-page">
        <div className="loading-wrapper"><div className="spinner" /><span>Loading job...</span></div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="form-page">
        <div className="alert alert-error">⚠️ {error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>← Back</button>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-container">
        <div className="form-header">
          <div className="form-header-content">
            <div className="form-icon">✏️</div>
            <h1>Edit Job Posting</h1>
            <p>Update the details for <strong style={{ color: '#a5b4fc' }}>{job?.title}</strong></p>
          </div>
        </div>

        <div className="form-body">
          {error && <div className="alert alert-error" id="edit-error">⚠️ {error}</div>}
          <JobForm
            initialData={job}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Save Changes"
          />
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/jobs/${id}`)}
              id="cancel-edit-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
