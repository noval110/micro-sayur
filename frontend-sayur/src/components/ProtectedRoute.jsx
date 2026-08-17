import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated } = useAuth();

  // Jika belum login, arahkan ke login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Jika route khusus admin, hanya Super Admin yang boleh masuk
  if (adminOnly && user?.role !== 'Super Admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}