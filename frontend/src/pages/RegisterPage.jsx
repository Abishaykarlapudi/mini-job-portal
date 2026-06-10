import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password, form.role);
      if (data.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">✨</div>
          <h1>Create Account</h1>
          <p>Join JobPortal today — it's free</p>
        </div>

        {error && (
          <div className="alert alert-error" id="register-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} id="register-form" className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              name="confirmPassword"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role Picker */}
          <div className="form-group">
            <label>I am a...</label>
            <div className="role-picker" id="role-picker">
              <button
                type="button"
                id="role-candidate"
                className={`role-btn ${form.role === 'candidate' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'candidate' })}
              >
                <span className="role-icon">🎓</span>
                <span className="role-label">Candidate</span>
                <span className="role-desc">Looking for jobs</span>
              </button>
              <button
                type="button"
                id="role-recruiter"
                className={`role-btn ${form.role === 'recruiter' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'recruiter' })}
              >
                <span className="role-icon">🏢</span>
                <span className="role-label">Recruiter</span>
                <span className="role-desc">Hiring talent</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
            id="register-submit"
          >
            {loading ? (
              <>
                <span className="btn-spinner" /> Creating account...
              </>
            ) : (
              '🎉 Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" id="go-login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
