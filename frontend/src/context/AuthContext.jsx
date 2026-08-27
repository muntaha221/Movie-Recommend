import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('https://vibeflix-ai.vercel.app/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser({ token, ...res.data });
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password, username) => {
    const payload = username ? { username } : { email, password };
    const res = await axios.post('https://vibeflix-ai.vercel.app/api/auth/login', payload);
    localStorage.setItem('token', res.data.token);
    setUser({ token: res.data.token, ...res.data.user });
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post('https://vibeflix-ai.vercel.app/api/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    setUser({ token: res.data.token, ...res.data.user });
    return res.data;
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await axios.get('https://vibeflix-ai.vercel.app/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser({ token, ...res.data });
      } catch (err) {
        console.error('Failed to refresh user profile');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
