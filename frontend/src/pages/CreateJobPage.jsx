import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import JobForm from '../components/JobForm';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.createJob(formData);
      if (data.success) {
        navigate(`/jobs/${data.data._id}`);
      } else {
        setError(data.message || 'Failed to create job');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <div className="form-header">
          <div className="form-header-content">
            <div className="form-icon">✨</div>
            <h1>Post a New Job</h1>
            <p>Reach thousands of qualified candidates. Fill in the details below.</p>
          </div>
        </div>

        <div className="form-body">
          {error && <div className="alert alert-error" id="create-error">⚠️ {error}</div>}
          <JobForm
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Post Job"
          />
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/')} id="cancel-create-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
