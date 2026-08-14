import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Note: In real app, /orders might need admin auth, assuming it passes through gateway
        const res = await api.get('/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        
        // Sort by ID descending (newest first)
        const sortedData = [...data].sort((a, b) => b.id - a.id);
        setOrders(sortedData);
      } catch (err) {
        console.error("Gagal memuat pesanan", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [token]);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Daftar Transaksi Masuk</h1>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '1rem' }}>Order ID</th>
                <th style={{ padding: '1rem' }}>ID User</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Total Harga</th>
                <th style={{ padding: '1rem' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Memuat...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-gray)' }}>Belum ada transaksi</td></tr>
              ) : orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>ORD-{order.id.toString().padStart(4, '0')}</td>
                  <td style={{ padding: '1rem' }}>User #{order.user_id}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '50px', 
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      backgroundColor: order.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: order.status === 'PENDING' ? '#f59e0b' : 'var(--primary)'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>Rp {order.total_price?.toLocaleString('id-ID')}</td>
                  <td style={{ padding: '1rem' }}>
                    <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', border: '1px solid var(--border-light)' }}>
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
