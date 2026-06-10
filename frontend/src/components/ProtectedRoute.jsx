import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — wraps a route that requires authentication.
 * Optionally pass `role` to restrict to a specific role.
 *
 * Usage:
 *   <ProtectedRoute><CreateJobPage /></ProtectedRoute>
 *   <ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-wrapper" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <span>Authenticating...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
