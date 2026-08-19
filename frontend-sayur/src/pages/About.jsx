import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const IconTrendingUp = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </svg>
);

const IconUsers = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
  </svg>
);

const IconRefresh = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 11a8 8 0 0 0-15.5-2M4 5v4h4" />
    <path d="M4 13a8 8 0 0 0 15.5 2M20 19v-4h-4" />
  </svg>
);

const IconPlant = () => (
  <svg
    width="27"
    height="27"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 15h10v4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-4z" />
    <path d="M12 9a6 6 0 0 0-6-6H3v3a6 6 0 0 0 6 6h3z" />
    <path d="M12 11a6 6 0 0 1 6-6h3v3a6 6 0 0 1-6 6h-3z" />
    <path d="M12 15V9" />
  </svg>
);

const IconTruck = () => (
  <svg
    width="27"
    height="27"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M5 17H3V6a1 1 0 0 1 1-1h9v12M9 17h6M19 17h2v-6h-8M13 6h5l3 5" />
  </svg>
);

const IconStore = () => (
  <svg
    width="27"
    height="27"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21h18" />
    <path d="M5 21V10" />
    <path d="M19 21V10" />
    <path d="M9 21v-6h6v6" />
    <path d="M4 4h16l1 5a2 2 0 0 1-2 2 2.5 2.5 0 0 1-2-1 2.5 2.5 0 0 1-4 0 2.5 2.5 0 0 1-4 0 2.5 2.5 0 0 1-2 1 2 2 0 0 1-2-2l1-5" />
  </svg>
);

const IconArrow = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const IconCheck = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m5 12 4 4L19 6" />
  </svg>
);

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-decoration about-decoration-one" />
        <div className="about-hero-decoration about-decoration-two" />

        <div className="about-hero-content">

          <h1>
            Membawa Pasar Lokal
            <span> Naik Kelas Secara Digital</span>
          </h1>

          <p>
            Sayur-day adalah platform digital yang membantu
            produk pangan lokal menjangkau konsumen lebih
            mudah melalui katalog online, pemesanan,
            pembayaran, dan pengelolaan produk dalam satu
            ekosistem.
          </p>

          <div className="about-hero-actions">
            <Link
              to="/katalog"
              className="about-primary-button"
            >
              Jelajahi Produk
              <IconArrow />
            </Link>

            <a
              href="#cara-kerja"
              className="about-secondary-button"
            >
              Cara Kerja
            </a>
          </div>

          <div className="about-mini-benefits">
            <span>
              <IconCheck />
              Produk lokal
            </span>

            <span>
              <IconCheck />
              Harga transparan
            </span>

            <span>
              <IconCheck />
              Pemesanan digital
            </span>
          </div>
        </div>
      </section>

      <main className="about-content">
        <section className="about-impact-grid">
          <article className="impact-card">
            <div className="impact-icon green">
              <IconTrendingUp />
            </div>

            <div>
              <span>Digitalisasi</span>
              <h3>Usaha Lebih Mudah Berkembang</h3>
              <p>
                Produk lokal dapat ditampilkan dan dikelola
                melalui katalog digital yang mudah digunakan.
              </p>
            </div>
          </article>

          <article className="impact-card">
            <div className="impact-icon blue">
              <IconUsers />
            </div>

            <div>
              <span>Akses Pasar</span>
              <h3>Terhubung dengan Lebih Banyak Konsumen</h3>
              <p>
                Pelaku usaha tidak lagi hanya bergantung
                pada transaksi secara langsung di pasar.
              </p>
            </div>
          </article>

          <article className="impact-card">
            <div className="impact-icon amber">
              <IconRefresh />
            </div>

            <div>
              <span>Efisiensi</span>
              <h3>Pengelolaan Lebih Terstruktur</h3>
              <p>
                Produk, stok, pesanan, hingga pembayaran
                dapat dipantau secara digital.
              </p>
            </div>
          </article>
        </section>

        <section className="about-story">
          <div className="about-story-content">
            <span className="section-eyebrow">
              Kenapa Sayur-day?
            </span>

            <h2>
              Dari proses tradisional menuju ekosistem
              perdagangan yang lebih modern.
            </h2>

            <p>
              Banyak usaha pangan lokal memiliki produk
              berkualitas, tetapi masih terbatas dalam
              pemasaran, pencatatan pesanan, serta jangkauan
              konsumen.
            </p>

            <p>
              Sayur-day hadir sebagai jembatan digital yang
              membuat proses tersebut lebih sederhana tanpa
              menghilangkan identitas usaha lokal.
            </p>

            <div className="story-checklist">
              <div>
                <IconCheck />
                Katalog produk digital
              </div>

              <div>
                <IconCheck />
                Pengelolaan stok terpusat
              </div>

              <div>
                <IconCheck />
                Pemesanan dan pembayaran online
              </div>

              <div>
                <IconCheck />
                Dashboard administrasi
              </div>
            </div>
          </div>

          <div className="about-story-visual">
            <div className="visual-card visual-main">
              <div className="visual-leaf">
                <IconPlant />
              </div>

              <span>Ekosistem Digital</span>

              <strong>
                Dari produk lokal hingga sampai ke pelanggan.
              </strong>
            </div>

            <div className="visual-floating visual-floating-top">
              <IconStore />
              UMKM Digital
            </div>

            <div className="visual-floating visual-floating-bottom">
              <IconTruck />
              Distribusi Efisien
            </div>
          </div>
        </section>

        <section
          className="about-process"
          id="cara-kerja"
        >
          <div className="about-section-heading">
            <span className="section-eyebrow">
              Cara Kerja
            </span>

            <h2>
              Sederhana untuk pembeli,
              bermanfaat untuk pelaku usaha
            </h2>

            <p>
              Sayur-day menghubungkan proses jual beli
              lokal dalam alur digital yang sederhana.
            </p>
          </div>

          <div className="process-grid">
            <article className="process-card">
              <span className="process-number">
                01
              </span>

              <div className="feature-icon-box emerald">
                <IconStore />
              </div>

              <h3>Produk Ditampilkan</h3>

              <p>
                Admin menambahkan produk, harga,
                kategori, stok, dan gambar ke katalog.
              </p>
            </article>

            <article className="process-card">
              <span className="process-number">
                02
              </span>

              <div className="feature-icon-box blue">
                <IconUsers />
              </div>

              <h3>Pelanggan Memesan</h3>

              <p>
                Konsumen memilih produk, memasukkannya
                ke keranjang, lalu melakukan checkout.
              </p>
            </article>

            <article className="process-card">
              <span className="process-number">
                03
              </span>

              <div className="feature-icon-box amber">
                <IconTruck />
              </div>

              <h3>Pesanan Diproses</h3>

              <p>
                Admin memantau pembayaran dan mengelola
                status pesanan hingga selesai.
              </p>
            </article>
          </div>
        </section>

        <section className="about-values">
          <div className="about-section-heading">
            <span className="section-eyebrow">
              Nilai Utama
            </span>

            <h2>Mengapa Memilih Sayur-day?</h2>

            <p>
              Teknologi yang dibuat untuk membantu
              perdagangan lokal menjadi lebih modern.
            </p>
          </div>

          <div className="about-features-grid">
            <article className="feature-modern-card">
              <div className="card-top-accent green" />

              <div className="feature-icon-box emerald">
                <IconPlant />
              </div>

              <h3>Produk Lokal Berdaya</h3>

              <p>
                Memberikan ruang digital bagi produk
                lokal agar lebih mudah ditemukan dan
                dijangkau konsumen.
              </p>
            </article>

            <article className="feature-modern-card">
              <div className="card-top-accent blue" />

              <div className="feature-icon-box blue">
                <IconTruck />
              </div>

              <h3>Proses Lebih Efisien</h3>

              <p>
                Pemesanan dan pengelolaan transaksi
                dibuat lebih terstruktur dalam satu
                sistem.
              </p>
            </article>

            <article className="feature-modern-card">
              <div className="card-top-accent amber" />

              <div className="feature-icon-box amber">
                <IconStore />
              </div>

              <h3>UMKM Goes Digital</h3>

              <p>
                Membantu usaha lokal beradaptasi dengan
                teknologi tanpa meninggalkan karakter
                dan nilai lokal.
              </p>
            </article>
          </div>
        </section>

        <section className="about-cta">
          <div>
            <span>Mulai dari produk lokal</span>

            <h2>
              Belanja lebih mudah,
              dukung usaha lokal lebih dekat.
            </h2>

            <p>
              Temukan berbagai kebutuhan segar
              langsung melalui Sayur-day.
            </p>
          </div>

          <Link
            to="/katalog"
            className="about-cta-button"
          >
            Lihat Katalog
            <IconArrow />
          </Link>
        </section>
      </main>
    </div>
  );
}
