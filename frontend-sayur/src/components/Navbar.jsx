import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconLeaf, IconShoppingCart, IconMenu2, IconX } from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartDrawer from './CartDrawer';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-container">
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            <span className="brand-icon"><IconLeaf size={28} color="var(--primary)" /></span>
            <span className="brand-text">Sayur-day</span>
          </Link>
          
          {/* Mobile menu button */}
          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </button>

          <div className={`navbar-content ${isMenuOpen ? 'open' : ''}`}>
            <div className="navbar-links">
              <Link to="/" className={isActive('/')} onClick={closeMenu}>Beranda</Link>
              <Link to="/katalog" className={isActive('/katalog')} onClick={closeMenu}>Katalog Belanja</Link>
              <Link to="/about" className={isActive('/about')} onClick={closeMenu}>Tentang Kami</Link>
              <Link to="/contact" className={isActive('/contact')} onClick={closeMenu}>Kontak</Link>
            </div>
            
            <div className="navbar-actions flex items-center gap-md">
              <button 
                className="cart-btn" 
                aria-label="Keranjang Belanja" 
                onClick={() => { closeMenu(); setIsCartOpen(true); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)' }}
              >
                <IconShoppingCart size={24} /> 
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
              
              {isAuthenticated ? (
                <>
                  {(user?.role === 'admin' || user?.role === 'Super Admin') && (
                    <Link to="/admin" className="btn btn-outline" onClick={closeMenu}>Dasbor Admin</Link>
                  )}
                  <button className="btn btn-outline" onClick={() => { logout(); closeMenu(); }} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Keluar</button>
                </>
              ) : (
                <Link to="/login" className="btn btn-outline" onClick={closeMenu}>Masuk</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <CartDrawer />
    </>
  );
}
