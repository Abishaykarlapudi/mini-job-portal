import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('jp_token');
    const storedUser = localStorage.getItem('jp_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Persist to localStorage whenever token/user change
  useEffect(() => {
    if (token && user) {
      localStorage.setItem('jp_token', token);
      localStorage.setItem('jp_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('jp_token');
      localStorage.removeItem('jp_user');
    }
  }, [token, user]);

  // Auth-aware fetch helper — injects Bearer token automatically
  const authFetch = useCallback(
    (url, options = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      };
      return fetch(url, { ...options, headers });
    },
    [token]
  );

  const register = async (name, email, password, role) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const isRecruiter = user?.role === 'recruiter';
  const isCandidate = user?.role === 'candidate';

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, authFetch, isRecruiter, isCandidate }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
