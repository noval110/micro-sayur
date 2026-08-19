import React from 'react';
import './Support.css';

export default function HowToBuy() {
  return (
    <div className="support-page">
      <div className="support-header-modern">
        <h1>Cara Pembelian</h1>
        <p>
          Ikuti langkah-langkah mudah berikut untuk mulai berbelanja kebutuhan sayur dan buah segar di Micro-Sayur.
        </p>
      </div>

      <div className="support-container-modern">
        <div className="support-content-card">
          <h2>Langkah Berbelanja</h2>
          
          <ol>
            <li>
              <span className="highlight">Buat Akun atau Masuk</span>
              <br />
              Pastikan Anda sudah memiliki akun di Micro-Sayur. Klik tombol "Login" atau "Daftar" di sudut kanan atas halaman.
            </li>
            <li>
              <span className="highlight">Cari Produk</span>
              <br />
              Gunakan kotak pencarian atau telusuri menu "Katalog" untuk menemukan sayuran, buah, atau bumbu dapur yang Anda butuhkan.
            </li>
            <li>
              <span className="highlight">Tambahkan ke Keranjang</span>
              <br />
              Klik tombol keranjang pada produk yang Anda inginkan. Anda dapat menyesuaikan jumlah barang langsung di dalam keranjang belanja.
            </li>
            <li>
              <span className="highlight">Proses Checkout</span>
              <br />
              Setelah selesai memilih, buka keranjang belanja Anda dan klik tombol "Checkout". Masukkan alamat pengiriman dengan lengkap dan benar.
            </li>
            <li>
              <span className="highlight">Pilih Metode Pembayaran</span>
              <br />
              Kami menyediakan berbagai metode pembayaran yang aman. Pilih metode yang paling nyaman untuk Anda dan selesaikan pembayaran.
            </li>
            <li>
              <span className="highlight">Tunggu Pesanan Tiba</span>
              <br />
              Pesanan Anda akan langsung diproses dan dikirimkan dengan aman sampai ke depan pintu rumah Anda!
            </li>
          </ol>

          <h3>Masih kesulitan berbelanja?</h3>
          <p>
            Jangan ragu untuk menghubungi layanan pelanggan kami melalui halaman <a href="/contact" className="highlight">Kontak Kami</a>. Kami siap memandu Anda!
          </p>
        </div>
      </div>
    </div>
  );
}
