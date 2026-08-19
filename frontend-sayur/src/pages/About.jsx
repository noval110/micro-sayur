import React from 'react';
import './About.css';

const IconTrendingUp = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6 -6l4 4l8 -8"/><path d="M14 7l7 0l0 7"/></svg>
);

const IconUsers = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/></svg>
);

const IconRefresh = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></svg>
);

const IconPlant = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 15h10v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2v-4z"/><path d="M12 9a6 6 0 0 0 -6 -6h-3v3a6 6 0 0 0 6 6h3z"/><path d="M12 11a6 6 0 0 1 6 -6h3v3a6 6 0 0 1 -6 6h-3z"/><path d="M12 15v-6"/></svg>
);

const IconTruck = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/></svg>
);

const IconStore = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l18 0"/><path d="M3 7l18 0"/><path d="M4 7l0 14"/><path d="M20 7l0 14"/><path d="M8 7l0 14"/><path d="M12 7l0 14"/><path d="M16 7l0 14"/><path d="M4 4l16 0"/><path d="M4 4l0 3"/><path d="M20 4l0 3"/></svg>
);

export default function About() {
  return (
    <div className="about-page">
      <div className="about-hero-modern">
        <h1 className="about-hero-title">Menghubungkan Kebun Lokal ke Meja Makan Anda</h1>
        <p className="about-hero-desc">
          Sayur-day hadir memotong rantai distribusi panjang agar petani lokal mendapatkan apresiasi harga yang adil dan keluarga Indonesia menikmati kesegaran sejati.
        </p>
      </div>

      <div className="about-content-wrapper">
        <div className="about-stats-container">
          <div className="stat-box">
            <div className="stat-icon-wrap green"><IconTrendingUp /></div>
            <div>
              <h3>+30%</h3>
              <p>Margin Keuntungan Petani</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon-wrap blue"><IconUsers /></div>
            <div>
              <h3>500+</h3>
              <p>UMKM Pasar Terhubung</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon-wrap amber"><IconRefresh /></div>
            <div>
              <h3>Zero Waste</h3>
              <p>Sistem Pre-Order Akurat</p>
            </div>
          </div>
        </div>

        <div className="about-section-header">
          <h2>Mengapa Memilih Sayur-day?</h2>
          <p>Standar baru ekosistem pangan digital yang transparan dan berkelanjutan</p>
        </div>

        <div className="about-features-modern-grid">
          <div className="feature-modern-card">
            <div className="card-top-accent green"></div>
            <div className="feature-icon-box emerald"><IconPlant /></div>
            <h3>Petani Lokal Berdaya</h3>
            <p>Memotong jalur tengkulak secara langsung, memberikan kesejahteraan dan kepastian harga fair-trade bagi para petani.</p>
          </div>

          <div className="feature-modern-card">
            <div className="card-top-accent blue"></div>
            <div className="feature-icon-box blue"><IconTruck /></div>
            <h3>Segar Sampai Rumah</h3>
            <p>Dipanen di pagi subuh dan langsung dikirim kilat ke alamat Anda dengan garansi 100% uang kembali jika kualitas menurun.</p>
          </div>

          <div className="feature-modern-card">
            <div className="card-top-accent amber"></div>
            <div className="feature-icon-box amber"><IconStore /></div>
            <h3>UMKM Goes Digital</h3>
            <p>Memberdayakan pedagang pasar tradisional lewat platform teknologi modern agar tetap kompetitif di era digital.</p>
          </div>
        </div>
      </div>
    </div>
  );
}