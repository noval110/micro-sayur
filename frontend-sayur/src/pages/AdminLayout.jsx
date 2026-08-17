import React, {
  useState
} from 'react';

import {
  Link,
  NavLink,
  Outlet,
  useNavigate
} from 'react-router-dom';

import {
  IconArrowLeft,
  IconLayoutDashboard,
  IconLeaf,
  IconLogout,
  IconMenu2,
  IconPackage,
  IconShoppingBag,
  IconUser,
  IconUsers,
  IconX
} from '@tabler/icons-react';

import {
  useAuth
} from '../context/AuthContext';

import './AdminLayout.css';


export default function AdminLayout() {
  const {
    user,
    logout
  } = useAuth();

  const navigate =
    useNavigate();

  const [
    mobileSidebar,
    setMobileSidebar
  ] = useState(false);


  const handleLogout = () => {
    logout();

    navigate('/login');
  };


  const closeMobileSidebar = () => {
    setMobileSidebar(false);
  };


  return (
    <div className="admin-shell">

      {/* MOBILE OVERLAY */}

      {mobileSidebar && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={
            closeMobileSidebar
          }
          aria-label="Tutup sidebar"
        />
      )}


      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside
        className={
          mobileSidebar
            ? 'admin-sidebar admin-sidebar-open'
            : 'admin-sidebar'
        }
      >

        {/* BRAND */}

        <div className="admin-sidebar-brand">

          <Link
            to="/admin"
            onClick={
              closeMobileSidebar
            }
            className="admin-brand"
          >
            <span className="admin-brand-icon">
              <IconLeaf
                size={21}
              />
            </span>

            <div>
              <strong>
                Sayur-day
              </strong>

              <small>
                Admin Panel
              </small>
            </div>
          </Link>


          <button
            type="button"
            className="admin-sidebar-close"
            onClick={
              closeMobileSidebar
            }
          >
            <IconX size={20} />
          </button>

        </div>


        {/* ADMIN PROFILE */}

        <div className="admin-profile">

          <div className="admin-profile-avatar">
            <IconUser
              size={20}
            />
          </div>

          <div className="admin-profile-info">
            <strong>
              {user?.name ||
                'Administrator'}
            </strong>

            <span>
              {user?.role ||
                'Super Admin'}
            </span>
          </div>

        </div>


        {/* NAVIGATION */}

        <div className="admin-sidebar-content">

          <span className="admin-menu-label">
            Menu Utama
          </span>


          <nav className="admin-navigation">

            <NavLink
              to="/admin"
              end
              onClick={
                closeMobileSidebar
              }
              className={({
                isActive
              }) =>
                isActive
                  ? 'admin-nav-link active'
                  : 'admin-nav-link'
              }
            >
              <span className="admin-nav-icon">
                <IconLayoutDashboard
                  size={19}
                />
              </span>

              <span>
                Dashboard
              </span>
            </NavLink>


            <NavLink
              to="/admin/products"
              onClick={
                closeMobileSidebar
              }
              className={({
                isActive
              }) =>
                isActive
                  ? 'admin-nav-link active'
                  : 'admin-nav-link'
              }
            >
              <span className="admin-nav-icon">
                <IconPackage
                  size={19}
                />
              </span>

              <span>
                Kelola Produk
              </span>
            </NavLink>


            <NavLink
              to="/admin/orders"
              onClick={
                closeMobileSidebar
              }
              className={({
                isActive
              }) =>
                isActive
                  ? 'admin-nav-link active'
                  : 'admin-nav-link'
              }
            >
              <span className="admin-nav-icon">
                <IconShoppingBag
                  size={19}
                />
              </span>

              <span>
                Kelola Pesanan
              </span>
            </NavLink>


            <NavLink
              to="/admin/users"
              onClick={
                closeMobileSidebar
              }
              className={({
                isActive
              }) =>
                isActive
                  ? 'admin-nav-link active'
                  : 'admin-nav-link'
              }
            >
              <span className="admin-nav-icon">
                <IconUsers
                  size={19}
                />
              </span>

              <span>
                Kelola Pengguna
              </span>
            </NavLink>

          </nav>

        </div>


        {/* SIDEBAR FOOTER */}

        <div className="admin-sidebar-footer">

          <Link
            to="/"
            className="admin-back-store"
          >
            <IconArrowLeft
              size={17}
            />

            Kembali ke Toko
          </Link>


          <button
            type="button"
            className="admin-logout"
            onClick={
              handleLogout
            }
          >
            <IconLogout
              size={17}
            />

            Keluar
          </button>

        </div>

      </aside>


      {/* =====================================
          MAIN
      ===================================== */}

      <div className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">

          <div className="admin-topbar-left">

            <button
              type="button"
              className="admin-mobile-menu"
              onClick={() =>
                setMobileSidebar(true)
              }
            >
              <IconMenu2
                size={21}
              />
            </button>


            <div>
              <span>
                Sayur-day
              </span>

              <strong>
                Administration
              </strong>
            </div>

          </div>


          <div className="admin-topbar-profile">

            <div>
              <strong>
                {user?.name ||
                  'Administrator'}
              </strong>

              <span>
                {user?.role ||
                  'Super Admin'}
              </span>
            </div>

            <div className="admin-topbar-avatar">
              <IconUser
                size={18}
              />
            </div>

          </div>

        </header>


        {/* PAGE CONTENT */}

        <main className="admin-page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
