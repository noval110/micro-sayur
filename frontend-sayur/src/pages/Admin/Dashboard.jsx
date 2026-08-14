import React, { useState, useEffect } from 'react';
import { IconPackage, IconReceipt, IconUsers, IconTrendingUp } from '@tabler/icons-react';
import api from '../../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodRes, ordRes] = await Promise.all([
          api.get('/products'),
          api.get('/orders')
        ]);
        
        const prodData = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.data || []);
        const ordData = Array.isArray(ordRes.data) ? ordRes.data : (ordRes.data?.data || []);

        setStats({
          products: prodData.length,
          orders: ordData.length
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
      </div>

      {loading ? (
        <p>Memuat data...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
              <IconPackage size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--text-gray)', margin: 0, fontSize: '0.9rem' }}>Total Produk</p>
              <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-dark)' }}>{stats.products}</h3>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: '#3b82f6' }}>
              <IconReceipt size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--text-gray)', margin: 0, fontSize: '0.9rem' }}>Total Pesanan</p>
              <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-dark)' }}>{stats.orders}</h3>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '50%', color: '#f59e0b' }}>
              <IconUsers size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--text-gray)', margin: 0, fontSize: '0.9rem' }}>Pelanggan Aktif</p>
              <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-dark)' }}>124</h3>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: '#8b5cf6' }}>
              <IconTrendingUp size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--text-gray)', margin: 0, fontSize: '0.9rem' }}>Pendapatan Bulan Ini</p>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-dark)' }}>Rp 4.5M</h3>
            </div>
          </div>

        </div>
      )}
      
      <div className="card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <h3>Selamat Datang di Sayur-day Admin!</h3>
        <p style={{ color: 'var(--text-gray)' }}>Gunakan panel navigasi di sebelah kiri untuk mengelola katalog produk dan melihat transaksi pesanan yang masuk.</p>
      </div>
    </div>
  );
}
