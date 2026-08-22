import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import Login from '../../presentation/pages/Login';
import Register from '../../presentation/pages/Register';
import Dashboard from '../../presentation/pages/Dashboard';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-slate-400 font-medium">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
