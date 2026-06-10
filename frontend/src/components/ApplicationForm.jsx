import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const EMPTY = { name: '', email: '', phone: '' };

export default function ApplicationForm({ jobId, onSuccess }) {
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    return e;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setForm({ name: user?.name || '', email: user?.email || '', phone: '' });
        if (onSuccess) onSuccess();
      } else {
        setStatus({ type: 'error', msg: data.message || 'Application failed' });
      }
    } catch {
      setStatus({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="alert alert-success" id="apply-success-msg">
        🎉 Application submitted successfully! Good luck!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate id="application-form">
      {status?.type === 'error' && (
        <div className="alert alert-error">⚠️ {status.msg}</div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="app-name">
          Full Name <span className="required">*</span>
        </label>
        <input
          id="app-name" name="name" type="text"
          className={`form-input ${errors.name ? 'error' : ''}`}
          placeholder="John Doe"
          value={form.name} onChange={handleChange}
        />
        {errors.name && <span className="error-msg">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="app-email">
          Email Address <span className="required">*</span>
        </label>
        <input
          id="app-email" name="email" type="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          placeholder="john@example.com"
          value={form.email} onChange={handleChange}
        />
        {errors.email && <span className="error-msg">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="app-phone">
          Phone Number <span className="required">*</span>
        </label>
        <input
          id="app-phone" name="phone" type="tel"
          className={`form-input ${errors.phone ? 'error' : ''}`}
          placeholder="+91 9876543210"
          value={form.phone} onChange={handleChange}
        />
        {errors.phone && <span className="error-msg">{errors.phone}</span>}
      </div>

      <button
        type="submit"
        className="btn btn-success"
        style={{ width: '100%', justifyContent: 'center' }}
        disabled={loading}
        id="apply-submit-btn"
      >
        {loading ? '⏳ Submitting...' : '🚀 Apply Now'}
      </button>
    </form>
  );
}
