import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          // Verify token with backend
          const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          
          if (response.ok) {
            setUser(JSON.parse(storedUser));
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        toast.success('Registration successful! Please login.');
        return { success: true };
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Registration failed');
        return { success: false, error: error.detail };
      }
    } catch (error) {
      toast.error('Network error. Please check if backend is running.');
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.full_name}!`);
        return { success: true };
      } else {
        toast.error(data.detail || 'Login failed');
        return { success: false, error: data.detail };
      }
    } catch (error) {
      toast.error('Network error. Please check if backend is running.');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};