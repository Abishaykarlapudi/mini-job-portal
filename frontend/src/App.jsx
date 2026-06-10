import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import HomePage from './pages/HomePage';
import JobDetailPage from './pages/JobDetailPage';
import CreateJobPage from './pages/CreateJobPage';
import EditJobPage from './pages/EditJobPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function Navbar({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const { user, logout, isRecruiter } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-brand" onClick={e => { e.preventDefault(); navigate('/'); }}>
          <div className="brand-icon">💼</div>
          <span className="brand-text">JobPortal</span>
        </a>

        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Browse Jobs
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
          )}
          {isRecruiter && (
            <NavLink to="/jobs/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Post a Job
            </NavLink>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              <div className="user-pill" id="user-pill">
                <span className={`role-dot ${user.role === 'recruiter' ? 'dot-recruiter' : 'dot-candidate'}`} />
                <span className="user-name">{user.name}</span>
                <span className={`role-tag ${user.role === 'recruiter' ? 'recruiter-tag' : 'candidate-tag'}`}>
                  {user.role}
                </span>
              </div>
              <button
                className="btn btn-sm btn-ghost"
                onClick={handleLogout}
                id="logout-btn"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link" id="nav-login">Sign In</NavLink>
              <NavLink to="/register" className="btn-post-job" id="nav-register">
                Get Started
              </NavLink>
            </>
          )}
          <button
            id="theme-toggle"
            className="theme-toggle"
            onClick={toggleTheme}
            title="Toggle dark/light mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}

function DashboardRouter() {
  const { isRecruiter } = useAuth();
  return isRecruiter ? <RecruiterDashboard /> : <CandidateDashboard />;
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <AuthProvider>
      <Router>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />

          {/* Protected (any auth) */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardRouter /></ProtectedRoute>
          } />

          {/* Protected (recruiter only) */}
          <Route path="/jobs/create" element={
            <ProtectedRoute role="recruiter"><CreateJobPage /></ProtectedRoute>
          } />
          <Route path="/jobs/:id/edit" element={
            <ProtectedRoute role="recruiter"><EditJobPage /></ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
