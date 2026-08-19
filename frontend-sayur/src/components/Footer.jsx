import React from 'react';
import { Link } from 'react-router-dom';
import { IconLeaf } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import './Footer.css';

export default function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="footer-container">
      <div className="footer-main">
        {/* BRAND */}
        <div className="footer-brand-column">
          <Link to="/" className="footer-logo">
            <span>
              <IconLeaf size={20} />
            </span>
            Sayur-day
          </Link>
          <p>
            Supermarket online untuk kebutuhan bahan dapur segar sehari-hari dengan proses belanja yang praktis.
          </p>
        </div>

        {/* CATEGORY */}
        <div className="footer-column">
          <h4>Kategori</h4>
          <Link to="/katalog?category=Buah">Buah-buahan</Link>
          <Link to="/katalog?category=Sayur">Sayuran</Link>
          <Link to="/katalog?category=Umbi">Umbi</Link>
          <Link to="/katalog?category=Bumbu">Bumbu Dapur</Link>
        </div>

        {/* CUSTOMER */}
        {isAuthenticated && (
          <div className="footer-column">
            <h4>Akun</h4>
            <Link to="/profile">Profil Saya</Link>
            <Link to="/my-orders">Pesanan Saya</Link>
            <Link to="/cart">Keranjang</Link>
            <Link to="/katalog">Katalog</Link>
          </div>
        )}

        {/* HELP */}
        <div className="footer-column">
          <h4>Bantuan</h4>
          <Link to="/how-to-buy">Cara Pembelian</Link>
          <Link to="/returns">Pengembalian Barang</Link>
          <Link to="/terms">Syarat & Ketentuan</Link>
          <Link to="/contact">Kontak Kami</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Sayur-day. All rights reserved.</span>
        <span>Sayur segar untuk hidup sehat.</span>
      </div>
    </footer>
  );
}
