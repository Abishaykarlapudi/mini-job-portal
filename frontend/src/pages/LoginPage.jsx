import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.success) {
        navigate(from, { replace: true });
      } else {
        setError(data.message || 'Login failed. Check your credentials.');
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
          <div className="auth-icon">🔐</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your JobPortal account</p>
        </div>

        {error && (
          <div className="alert alert-error" id="login-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} id="login-form" className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
            id="login-submit"
          >
            {loading ? (
              <>
                <span className="btn-spinner" /> Signing in...
              </>
            ) : (
              '🚀 Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" id="go-register">
            Create one free
          </Link>
        </div>

        <div className="auth-divider">
          <span>Demo Accounts</span>
        </div>
        <div className="demo-accounts">
          <div className="demo-account">
            <span className="demo-role recruiter-badge">Recruiter</span>
            <span>Register with role: recruiter</span>
          </div>
          <div className="demo-account">
            <span className="demo-role candidate-badge">Candidate</span>
            <span>Register with role: candidate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
