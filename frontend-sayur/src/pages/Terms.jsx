import React from 'react';
import './Support.css';

export default function Terms() {
  return (
    <div className="support-page">
      <div className="support-header-modern">
        <h1>Syarat & Ketentuan</h1>
        <p>
          Mohon baca dengan saksama Syarat dan Ketentuan layanan aplikasi Micro-Sayur sebelum Anda bertransaksi.
        </p>
      </div>

      <div className="support-container-modern">
        <div className="support-content-card">
          <h2>Ketentuan Umum</h2>
          <p>
            Dengan menggunakan platform Micro-Sayur, pengguna dianggap telah membaca, memahami, dan menyetujui seluruh isi Syarat dan Ketentuan ini. Layanan kami ditujukan untuk memudahkan Anda berbelanja sayur dan bahan pangan segar secara daring.
          </p>

          <h3>1. Akun Pengguna</h3>
          <ul>
            <li>Pengguna wajib mendaftarkan diri menggunakan data yang valid dan aktif.</li>
            <li>Keamanan password dan akun adalah tanggung jawab pengguna secara penuh.</li>
            <li>Micro-Sayur berhak menangguhkan akun jika ditemukan aktivitas mencurigakan atau melanggar ketentuan hukum.</li>
          </ul>

          <h3>2. Proses Transaksi dan Harga</h3>
          <ul>
            <li>Harga yang tertera di aplikasi dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya, bergantung pada kondisi pasar produk segar.</li>
            <li>Harga yang dibebankan kepada pembeli adalah harga pada saat proses checkout selesai.</li>
            <li>Jika terjadi kesalahan sistem dalam menampilkan harga secara tidak wajar, Micro-Sayur berhak membatalkan pesanan tersebut sepihak.</li>
          </ul>

          <h3>3. Pengiriman</h3>
          <ul>
            <li>Kami bekerja sama dengan kurir mitra tepercaya untuk menjaga pesanan tiba dalam keadaan segar.</li>
            <li>Keterlambatan pengiriman yang diakibatkan oleh *force majeure* (bencana alam, cuaca buruk ekstrim) akan diinformasikan, dan Micro-Sayur tidak bertanggung jawab atas kerugian tidak langsung akibat hal tersebut.</li>
          </ul>

          <h3>4. Privasi dan Data</h3>
          <p>
            Kami berkomitmen menjaga kerahasiaan data pribadi pengguna. Informasi pengiriman dan kontak tidak akan diperjualbelikan kepada pihak ketiga.
          </p>
        </div>
      </div>
    </div>
  );
}
