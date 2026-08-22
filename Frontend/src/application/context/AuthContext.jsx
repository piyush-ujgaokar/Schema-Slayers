import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../../infrastructure/api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('builder_token');
      if (token) {
        try {
          const response = await apiClient.get('/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('builder_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user: loggedUser } = response.data;
      localStorage.setItem('builder_token', token);
      setUser(loggedUser);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      const { token, user: registeredUser } = response.data;
      localStorage.setItem('builder_token', token);
      setUser(registeredUser);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('builder_token');
    localStorage.removeItem('visual_builder_current_ir');
    localStorage.removeItem('visual_builder_current_project');
    localStorage.removeItem('visual_builder_active_tab');
    localStorage.removeItem('visual_builder_selected_file');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
