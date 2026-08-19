import React from 'react';
import './Support.css';

export default function Returns() {
  return (
    <div className="support-page">
      <div className="support-header-modern">
        <h1>Pengembalian Barang</h1>
        <p>
          Kami menjamin kesegaran produk kami. Jika ada yang tidak sesuai, jangan khawatir, proses retur kami sangat mudah.
        </p>
      </div>

      <div className="support-container-modern">
        <div className="support-content-card">
          <h2>Kebijakan Pengembalian</h2>
          <p>
            Kualitas dan kesegaran produk adalah prioritas utama Micro-Sayur. Jika Anda menerima barang yang rusak, layu, atau tidak sesuai pesanan, kami memberikan fasilitas pengembalian dana atau penukaran barang dengan syarat berikut:
          </p>

          <ul>
            <li>Komplain harus dilakukan maksimal <span className="highlight">1x24 jam</span> setelah pesanan diterima.</li>
            <li>Anda wajib melampirkan bukti berupa <span className="highlight">foto atau video unboxing</span> yang jelas.</li>
            <li>Produk harus disimpan dengan benar (misal: masuk kulkas jika diperlukan) sebelum dikembalikan.</li>
          </ul>

          <h3>Langkah-langkah Retur</h3>
          <ol>
            <li>Hubungi tim Customer Service kami melalui WhatsApp atau menu Kontak Kami.</li>
            <li>Sertakan nomor pesanan dan bukti foto/video kondisi produk.</li>
            <li>Tim kami akan memverifikasi laporan Anda dalam waktu maksimal 2 jam di jam operasional.</li>
            <li>Jika memenuhi syarat, kami akan memproses penukaran barang pada jadwal pengiriman berikutnya atau memberikan pengembalian dana 100%.</li>
          </ol>

          <h3>Pengecualian</h3>
          <p>
            Retur tidak berlaku jika kerusakan disebabkan oleh kelalaian pembeli (contoh: salah penyimpanan setelah diterima) atau perubahan pikiran (berubah pikiran tidak mau membeli).
          </p>
        </div>
      </div>
    </div>
  );
}
