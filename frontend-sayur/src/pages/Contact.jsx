import React, { useState } from 'react';
import { IconMapPin, IconPhone, IconMail, IconSend, IconCheck } from '@tabler/icons-react';
import './Contact.css';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4500);
  };

  return (
    <div className="contact-page">
      <div className="contact-header-modern">
        <h1>Hubungi Tim Kami</h1>
        <p>
          Punya pertanyaan, kritik, saran, atau tertarik berkolaborasi sebagai mitra petani dan UMKM? Kami siap merespons dengan cepat.
        </p>
      </div>

      <div className="contact-container-modern">
        <div className="contact-grid-modern">
          
          <div className="contact-info-column">
            <div className="contact-info-pill-card">
              <div className="contact-icon-box green"><IconMapPin size={22} /></div>
              <div className="contact-details">
                <h4>Kantor Pusat</h4>
                <p>Gedung Sayur-day Lt. 3<br />Jl. Pertanian Modern No. 45<br />Jakarta Selatan, 12345</p>
              </div>
            </div>

            <div className="contact-info-pill-card">
              <div className="contact-icon-box blue"><IconPhone size={22} /></div>
              <div className="contact-details">
                <h4>Telepon / WhatsApp</h4>
                <p className="highlight-text">+62 895-0906-6231</p>
                <span>Senin - Jumat, 08:00 - 17:00 WIB</span>
              </div>
            </div>

            <div className="contact-info-pill-card">
              <div className="contact-icon-box amber"><IconMail size={22} /></div>
              <div className="contact-details">
                <h4>Email Dukungan</h4>
                <p>novalahmadanur@gmail.com</p>
                <p>mitra@sayur-day.id</p>
              </div>
            </div>
          </div>

          <div className="contact-form-box">
            <div className="form-box-header">
              <h3>Kirim Pesan Langsung</h3>
              <p>Isi formulir di bawah dan kami akan membalas via email.</p>
            </div>

            {submitted ? (
              <div className="contact-success-state">
                <div className="success-icon-circle">
                  <IconCheck size={32} />
                </div>
                <h4>Pesan Berhasil Terkirim!</h4>
                <p>Terima kasih telah menghubungi kami. Tim Sayur-day akan segera merespons pesan Anda.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form-modern">
                <div className="input-row">
                  <div className="form-group-modern">
                    <label>Nama Lengkap</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Cth: Budi Santoso"
                      className="modern-input"
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Alamat Email</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="Cth: budi@gmail.com"
                      className="modern-input"
                    />
                  </div>
                </div>

                <div className="form-group-modern">
                  <label>Pesan / Keperluan</label>
                  <textarea 
                    rows="4" 
                    required 
                    placeholder="Tuliskan pertanyaan atau penawaran kemitraan Anda secara detail..."
                    className="modern-textarea"
                  ></textarea>
                </div>

                <button type="submit" className="btn-send-modern">
                  <IconSend size={18} /> Kirim Pesan Sekarang
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}