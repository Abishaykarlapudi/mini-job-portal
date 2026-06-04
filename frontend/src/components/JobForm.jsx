import { useState, useEffect } from 'react';

const TYPES = ['Full-time', 'Part-time', 'Remote', 'Internship', 'Contract'];

const EMPTY = {
  title: '', company: '', location: '', type: 'Full-time',
  salary: '', description: '', logoUrl: '',
};

export default function JobForm({ initialData = {}, onSubmit, loading, submitLabel = 'Submit' }) {
  const [form, setForm] = useState({ ...EMPTY, ...initialData });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({ ...EMPTY, ...initialData });
  }, [initialData?.title]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Job title is required';
    if (!form.company.trim()) e.company = 'Company name is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.type) e.type = 'Job type is required';
    if (!form.description.trim()) e.description = 'Description is required';
    return e;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="title">
            Job Title <span className="required">*</span>
          </label>
          <input
            id="title" name="title" type="text"
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="e.g. Senior React Developer"
            value={form.title} onChange={handleChange}
          />
          {errors.title && <span className="error-msg">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="company">
            Company Name <span className="required">*</span>
          </label>
          <input
            id="company" name="company" type="text"
            className={`form-input ${errors.company ? 'error' : ''}`}
            placeholder="e.g. Google"
            value={form.company} onChange={handleChange}
          />
          {errors.company && <span className="error-msg">{errors.company}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="location">
            Location <span className="required">*</span>
          </label>
          <input
            id="location" name="location" type="text"
            className={`form-input ${errors.location ? 'error' : ''}`}
            placeholder="e.g. Bangalore, India"
            value={form.location} onChange={handleChange}
          />
          {errors.location && <span className="error-msg">{errors.location}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="type">
            Job Type <span className="required">*</span>
          </label>
          <select
            id="type" name="type"
            className={`form-select ${errors.type ? 'error' : ''}`}
            value={form.type} onChange={handleChange}
          >
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.type && <span className="error-msg">{errors.type}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="salary">Salary</label>
          <input
            id="salary" name="salary" type="text"
            className="form-input"
            placeholder="e.g. ₹12 LPA or $80,000/yr"
            value={form.salary} onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="logoUrl">Company Logo URL</label>
          <input
            id="logoUrl" name="logoUrl" type="url"
            className="form-input"
            placeholder="https://example.com/logo.png"
            value={form.logoUrl} onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">
          Job Description <span className="required">*</span>
        </label>
        <textarea
          id="description" name="description"
          className={`form-textarea ${errors.description ? 'error' : ''}`}
          placeholder="Describe the role, responsibilities, requirements, and what you're looking for..."
          value={form.description} onChange={handleChange}
          rows={6}
        />
        {errors.description && <span className="error-msg">{errors.description}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading} id="submit-job-btn">
          {loading ? '⏳ Saving...' : `✨ ${submitLabel}`}
        </button>
      </div>
    </form>
  );
}
