import { createContext, useContext, useState, useCallback } from 'react';
import { getProfile } from '../services/eventService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = useCallback((userData, jwtToken) => {
    localStorage.setItem('user',  JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
    setUser(userData);
    setToken(jwtToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await getProfile();
      const updated = data.data;
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch { /* ignore */ }
  }, []);

  const isAuthenticated = !!token;
  const isAdmin      = user?.role === 'admin';
  const isOrganizer  = user?.role === 'organizer' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isAdmin, isOrganizer, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
