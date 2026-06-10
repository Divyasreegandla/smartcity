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
      
      console.log('Loading user from storage:', { storedToken: !!storedToken, storedUser: !!storedUser });
      
      if (storedToken && storedUser) {
        try {
          // Verify token with backend
          const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          
          if (response.ok) {
            setUser(JSON.parse(storedUser));
            console.log('User loaded successfully:', JSON.parse(storedUser));
          } else {
            console.log('Token invalid, clearing storage');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
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
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Registration successful! Please login.');
        return { success: true };
      } else {
        toast.error(data.detail || 'Registration failed');
        return { success: false, error: data.detail };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Please check if backend is running.');
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext login called with:', email);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log('AuthContext login response:', data);
      
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
      console.error('Login error:', error);
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

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};