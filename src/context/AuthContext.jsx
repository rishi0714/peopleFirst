import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler } from '../api/client.js';

const AuthContext = createContext(null);

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('peoplefirst_user') || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('peoplefirst_token'));
  const [currentUser, setCurrentUser] = useState(readUser);

  const setUser = useCallback((user, accessToken, refreshToken) => {
    setCurrentUser(user);
    setToken(accessToken);

    if (accessToken) {
      localStorage.setItem('peoplefirst_token', accessToken);
      localStorage.setItem('peoplefirst_user', JSON.stringify(user));
      if (refreshToken) localStorage.setItem('peoplefirst_refresh_token', refreshToken);
    } else {
      localStorage.removeItem('peoplefirst_token');
      localStorage.removeItem('peoplefirst_user');
      localStorage.removeItem('peoplefirst_refresh_token');
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null, null, null);
  }, [setUser]);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  const value = useMemo(() => {
    const isAuthenticated = !!token && !!currentUser;
    const isContractor = !!currentUser && currentUser.contractor === true;
    const isManager = !!currentUser && (currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN');
    const isAdmin = !!currentUser && currentUser.role === 'ADMIN';

    return {
      token,
      currentUser,
      isAuthenticated,
      isContractor,
      isManager,
      isAdmin,
      setUser,
      logout,
    };
  }, [token, currentUser, setUser, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
