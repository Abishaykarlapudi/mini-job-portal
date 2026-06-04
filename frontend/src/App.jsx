import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import './index.css';
import HomePage from './pages/HomePage';
import JobDetailPage from './pages/JobDetailPage';
import CreateJobPage from './pages/CreateJobPage';
import EditJobPage from './pages/EditJobPage';

function Navbar({ theme, toggleTheme }) {
  const navigate = useNavigate();

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
          <NavLink to="/jobs/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Post a Job
          </NavLink>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <NavLink to="/jobs/create" className="btn-post-job">
            + Post Job
          </NavLink>
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

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <Router>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs/create" element={<CreateJobPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/jobs/:id/edit" element={<EditJobPage />} />
      </Routes>
    </Router>
  );
}

export default App;
