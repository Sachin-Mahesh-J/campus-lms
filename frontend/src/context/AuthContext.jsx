import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Rehydrate user from localStorage first so refresh doesn't "log out" on full reload
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem('authUser');
      }
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      // Try to refresh to get a fresh access token and latest user info
      authApi
        .refresh()
        .then((data) => {
          setUser(data);
          localStorage.setItem('authUser', JSON.stringify(data));
        })
        .catch(() => {
          // If refresh fails (e.g. no refresh cookie), keep current user and token;
          // API calls will continue using the existing access token until it expires.
        });
    }
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await authApi.login({ usernameOrEmail, password });
      setUser(response);
      localStorage.setItem('authUser', JSON.stringify(response));
      toast.success('Login successful');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authUser');
      toast.success('Logged out successfully');
    } catch (error) {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authUser');
    }
  };

  const isAuthenticated = !!user;
  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

