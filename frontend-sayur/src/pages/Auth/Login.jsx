import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconLeaf, IconMail, IconLock, IconLogin } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(formData.email, formData.password);
    
    if (res.success) {
      if (res.role === 'admin' || res.role === 'Super Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(res.error || 'Email atau password salah');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <IconLeaf size={32} color="var(--primary)" /> Sayur<span>day</span>
          </Link>
          <h1>Selamat Datang Kembali</h1>
          <p>Masuk ke akun Sayur-day Anda untuk melanjutkan belanja.</p>
        </div>

        {error && <div className="auth-alert error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <IconMail size={20} className="input-icon" />
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Masukkan email Anda" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <IconLock size={20} className="input-icon" />
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Masukkan password Anda" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
            {!loading && <IconLogin size={20} />}
          </button>
        </form>

        <div className="auth-footer">
          Belum punya akun? <Link to="/register" className="auth-link">Daftar sekarang</Link>
        </div>
      </div>
    </div>
  );
}
