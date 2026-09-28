import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mahsetu_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mahsetu_token') || null);
  const [loading, setLoading] = useState(false);

  const loginWithPersona = async (identifier, otp = '123456') => {
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { identifier, otp });
      if (res.data.success) {
        localStorage.setItem('mahsetu_token', res.data.token);
        localStorage.setItem('mahsetu_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setToken(res.data.token);
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('mahsetu_token');
    localStorage.removeItem('mahsetu_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loginWithPersona, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
