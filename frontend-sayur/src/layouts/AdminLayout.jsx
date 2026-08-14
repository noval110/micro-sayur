import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { IconLeaf, IconDashboard, IconPackage, IconReceipt, IconLogout, IconUserCircle } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <IconLeaf size={28} color="var(--primary)" />
          <span>Sayur-day <b>Admin</b></span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <IconDashboard size={20} /> <span className="hide-mobile">Dashboard</span>
          </NavLink>
          <NavLink to="/admin/products" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <IconPackage size={20} /> <span className="hide-mobile">Produk</span>
          </NavLink>
          <NavLink to="/admin/orders" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <IconReceipt size={20} /> <span className="hide-mobile">Transaksi</span>
          </NavLink>
          {/* Mobile only logout */}
          <button className="admin-nav-item logout-btn mobile-only" onClick={handleLogout}>
            <IconLogout size={20} />
          </button>
        </nav>

        <div className="admin-sidebar-footer desktop-only">
          <button className="admin-nav-item logout-btn" onClick={handleLogout}>
            <IconLogout size={20} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header-title">
            <h2>Manajemen Toko</h2>
          </div>
          <div className="admin-header-user">
            <span className="admin-user-name">Halo, {user?.name || 'Admin'}!</span>
            <IconUserCircle size={32} color="var(--primary)" />
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
