import React, { useState } from 'react';
import { IconMapPin, IconPhone, IconMail, IconSend } from '@tabler/icons-react';
import Navbar from '../components/Navbar';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      
      setTimeout(() => setIsSuccess(false), 5000); // Hide success after 5s
    }, 1500);
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <main className="contact-page">
        <section className="contact-header text-center">
          <div className="container">
            <h1>Hubungi Kami</h1>
            <p>Punya pertanyaan, saran, atau ingin bermitra dengan kami? Tim Sayur-day siap membantu Anda kapan saja.</p>
          </div>
        </section>

        <section className="contact-content container">
          <div className="contact-grid">
            
            {/* Contact Info */}
            <div className="contact-info">
              <h2>Informasi Kontak</h2>
              <p className="info-desc">Kami selalu terbuka untuk berdiskusi tentang digitalisasi UMKM dan kolaborasi pasokan sayuran segar.</p>
              
              <div className="info-card">
                <div className="info-icon"><IconMapPin size={24} color="var(--primary)" /></div>
                <div className="info-text">
                  <h3>Kantor Pusat</h3>
                  <p>Gedung Sayur-day Lt. 3<br/>Jl. Pertanian Modern No. 45<br/>Jakarta Selatan, 12345</p>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon"><IconPhone size={24} color="var(--primary)" /></div>
                <div className="info-text">
                  <h3>Telepon / WhatsApp</h3>
                  <p>+62 811-2233-4455<br/><span className="text-sm text-gray">(Senin - Jumat, 08:00 - 17:00)</span></p>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon"><IconMail size={24} color="var(--primary)" /></div>
                <div className="info-text">
                  <h3>Email</h3>
                  <p>halo@sayur-day.id<br/>mitra@sayur-day.id</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <div className="card form-card">
                <h2>Kirim Pesan</h2>
                {isSuccess ? (
                  <div className="success-alert">
                    <IconSend size={30} />
                    <h3>Pesan Terkirim!</h3>
                    <p>Terima kasih telah menghubungi kami. Tim kami akan segera membalas pesan Anda.</p>
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="name">Nama Lengkap</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        placeholder="Contoh: Budi Santoso"
                        value={formData.name}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder="Contoh: budi@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="message">Pesan Anda</label>
                      <textarea 
                        id="message" 
                        name="message" 
                        rows="5" 
                        placeholder="Tuliskan pertanyaan atau saran Anda di sini..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                    
                    <button type="submit" className="btn btn-primary btn-block submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                      {!isSubmitting && <IconSend size={18} style={{marginLeft: '8px'}} />}
                    </button>
                  </form>
                )}
              </div>
            </div>
            
          </div>
        </section>
      </main>
    </div>
  );
}
