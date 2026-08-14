import React from 'react';
import { IconLeaf, IconHeartHandshake, IconTruckDelivery, IconDeviceMobile } from '@tabler/icons-react';
import Navbar from '../components/Navbar';
import './About.css';

export default function About() {
  const features = [
    {
      icon: <IconHeartHandshake size={40} color="var(--primary)" />,
      title: "Petani Lokal Berdaya",
      desc: "Kami memotong rantai pasok panjang sehingga petani mendapatkan harga yang lebih adil dan pelanggan mendapatkan produk segar."
    },
    {
      icon: <IconTruckDelivery size={40} color="var(--primary)" />,
      title: "Segar Sampai Rumah",
      desc: "Produk dipanen di hari yang sama dengan pengiriman. Jaminan kesegaran maksimal untuk nutrisi keluarga Anda."
    },
    {
      icon: <IconDeviceMobile size={40} color="var(--primary)" />,
      title: "UMKM Goes Digital",
      desc: "Memberikan platform digital bagi pedagang pasar dan petani kecil untuk menjangkau pasar modern yang lebih luas."
    }
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <main className="about-page">
        <section className="about-hero">
          <div className="container">
            <div className="about-hero-content text-center">
              {/* <span className="badge">Tentang Kami</span> */}
              <h1>Digitalisasi Pertanian Lokal</h1>
              <p>Sayur-day lahir dari sebuah keresahan: bagaimana cara menghubungkan petani lokal dan pedagang sayur tradisional langsung ke meja makan keluarga modern melalui teknologi.</p>
            </div>
          </div>
        </section>

        <section className="about-vision container">
          <div className="vision-grid">
            <div className="vision-text">
              <h2>Misi Kami untuk UMKM</h2>
              <p>Sebagai bagian dari gerakan <strong>"UMKM Goes Digital"</strong>, kami percaya bahwa teknologi harus inklusif. Sayur-day bukan sekadar e-commerce biasa, melainkan sebuah ekosistem digital yang dirancang untuk:</p>
              <ul>
                <li>Meningkatkan margin keuntungan petani hingga 30%.</li>
                <li>Menghubungkan lebih dari 500+ UMKM pasar tradisional ke ekosistem online.</li>
                <li>Mengurangi food waste (limbah makanan) dengan sistem pre-order yang akurat.</li>
              </ul>
            </div>
            <div className="vision-image">
              <div className="image-card">
                <IconLeaf size={80} color="var(--primary)" />
                <h3>Bersama Membangun Negeri</h3>
              </div>
            </div>
          </div>
        </section>

        <section className="about-features bg-secondary">
          <div className="container">
            <h2 className="text-center mb-xl">Mengapa Memilih Sayur-day?</h2>
            <div className="features-grid">
              {features.map((feat, idx) => (
                <div key={idx} className="feature-card card">
                  <div className="feature-icon">{feat.icon}</div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
