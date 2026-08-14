import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconLeaf, IconMail, IconLock, IconUser, IconPhone, IconUserPlus } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setLoading(true);

    const res = await register(
      formData.name, 
      formData.email, 
      formData.password,
      formData.confirmPassword,
      formData.phone
    );
    
    setLoading(false);
    
    if (res.success) {
      setSuccess('Pendaftaran berhasil! Silakan login.');
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(res.error || 'Gagal melakukan pendaftaran');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <IconLeaf size={32} color="var(--primary)" /> Sayur<span>day</span>
          </Link>
          <h1>Daftar Akun Baru</h1>
          <p>Bergabunglah dengan ribuan keluarga yang telah menikmati kemudahan belanja sayur.</p>
        </div>

        {error && <div className="auth-alert error">{error}</div>}
        {success && <div className="auth-alert success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap</label>
            <div className="input-with-icon">
              <IconUser size={20} className="input-icon" />
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Masukkan nama lengkap Anda" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

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
            <label htmlFor="phone">Nomor Telepon</label>
            <div className="input-with-icon">
              <IconPhone size={20} className="input-icon" />
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                placeholder="Contoh: 081234567890" 
                value={formData.phone}
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
                placeholder="Buat password (min. 8 karakter)" 
                value={formData.password}
                onChange={handleChange}
                minLength="8"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmasi Password</label>
            <div className="input-with-icon">
              <IconLock size={20} className="input-icon" />
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                placeholder="Ulangi password Anda" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
            {!loading && <IconUserPlus size={20} />}
          </button>
        </form>

        <div className="auth-footer">
          Sudah punya akun? <Link to="/login" className="auth-link">Masuk di sini</Link>
        </div>
      </div>
    </div>
  );
}
