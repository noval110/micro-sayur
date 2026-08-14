import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sayur_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // Update local storage when user or token changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('sayur_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sayur_user');
    }
    
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [user, token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/users/signin', { email, password });
      const authData = res.data.data; // Added back
      const userData = {
        id: authData.id,
        name: authData.name,
        email: authData.email,
        role: authData.role,
        phone: authData.phone,
        address: "Jl. Contoh No 123" // Placeholder as there's no address from API
      };
      
      setUser(userData);
      setToken(authData.access_token);
      
      return { success: true, role: authData.role };
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan saat login';
      return { success: false, error: msg };
    }
  };

  const register = async (name, email, password, password_confirmation, phone) => {
    try {
      const res = await api.post('/users/signup', { name, email, password, password_confirmation, phone });
      return { success: true };
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      console.error("RESPONSE DATA:", err.response?.data);
      let msg = err.response?.data?.message || (err.response ? JSON.stringify(err.response.data) : err.message);
      
      if (msg.includes('duplicate key value violates unique constraint') || msg.includes('uni_users_email')) {
        msg = 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.';
      }
      
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Clear cart on logout
    localStorage.removeItem('sayur_cart');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
