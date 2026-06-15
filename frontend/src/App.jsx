import { useState, useEffect, useRef } from 'react';
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
import AnalyticsPage from './pages/AnalyticsPage';
import ProtectedRoute from './components/ProtectedRoute';

function Navbar({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const { user, logout, isRecruiter } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar" ref={menuRef}>
      <div className="navbar-inner">
        <a href="/" className="navbar-brand" onClick={e => { e.preventDefault(); navigate('/'); closeMenu(); }}>
          <div className="brand-icon">💼</div>
          <span className="brand-text">JobPortal</span>
        </a>

        {/* Desktop links */}
        <div className="navbar-links">
          {!isRecruiter && (
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Browse Jobs
            </NavLink>
          )}
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
          {isRecruiter && (
            <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-analytics">
              📊 Analytics
            </NavLink>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              {/* Desktop: user pill + sign out */}
              <div className="user-pill desktop-only" id="user-pill">
                <span className={`role-dot ${user.role === 'recruiter' ? 'dot-recruiter' : 'dot-candidate'}`} />
                <span className="user-name">{user.name}</span>
                <span className={`role-tag ${user.role === 'recruiter' ? 'recruiter-tag' : 'candidate-tag'}`}>
                  {user.role}
                </span>
              </div>
              <button className="btn btn-sm btn-ghost desktop-only" onClick={handleLogout} id="logout-btn">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link desktop-only" id="nav-login">Sign In</NavLink>
              <NavLink to="/register" className="btn-post-job desktop-only" id="nav-register">
                Get Started
              </NavLink>
            </>
          )}
          <button id="theme-toggle" className="theme-toggle" onClick={toggleTheme} title="Toggle dark/light mode">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            id="hamburger-btn"
          >
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="mobile-menu" id="mobile-menu">
          {!isRecruiter && (
            <NavLink to="/" end className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              🔍 Browse Jobs
            </NavLink>
          )}
          {user && (
            <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              📊 Dashboard
            </NavLink>
          )}
          {isRecruiter && (
            <NavLink to="/jobs/create" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              ➕ Post a Job
            </NavLink>
          )}
          {isRecruiter && (
            <NavLink to="/analytics" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              📈 Analytics
            </NavLink>
          )}
          <div className="mobile-menu-divider" />
          {user ? (
            <>
              <div className="mobile-user-info">
                <span className={`role-dot ${user.role === 'recruiter' ? 'dot-recruiter' : 'dot-candidate'}`} />
                <span>{user.name}</span>
                <span className={`role-tag ${user.role === 'recruiter' ? 'recruiter-tag' : 'candidate-tag'}`}>{user.role}</span>
              </div>
              <button className="mobile-nav-link mobile-signout" onClick={handleLogout}>
                🚪 Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                🔑 Sign In
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                🚀 Get Started
              </NavLink>
            </>
          )}
        </div>
      )}
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
          <Route path="/analytics" element={
            <ProtectedRoute role="recruiter"><AnalyticsPage /></ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
