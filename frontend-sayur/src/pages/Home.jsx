import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  IconLeaf, IconCarrot, IconLemon, IconMushroom, IconBasket,
  IconPackage, IconPlant, IconCoin, IconRocket, IconMapPin, IconSearch
} from '@tabler/icons-react';
import Navbar from '../components/Navbar';
import api from '../api';
import { useCart } from '../context/CartContext';
import './Home.css';

// Custom Hook for Typewriter Effect
const useTypewriter = (words, typingSpeed = 100, deletingSpeed = 50, delay = 2000) => {
  const [text, setText] = useState(words[0]); // Start with full first word
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(true); // Start in deleting phase
  const [isInitialWait, setIsInitialWait] = useState(true); // Initial pause

  useEffect(() => {
    const currentWord = words[wordIndex];
    
    const timer = setTimeout(() => {
      if (isInitialWait) {
        setIsInitialWait(false);
        return;
      }

      if (!isDeleting) {
        setText(currentWord.substring(0, text.length + 1));
        if (text === currentWord) {
          // Pause before deleting
          setIsDeleting(true);
        }
      } else {
        setText(currentWord.substring(0, text.length - 1));
        if (text === '') {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isInitialWait ? delay : (isDeleting ? deletingSpeed : (text === currentWord ? delay : typingSpeed)));

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, delay, isInitialWait]);

  return text;
};

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  // Typewriter placeholders
  const locationLocations = ["Di mana lokasimu?", "Jakarta Selatan", "Bekasi", "Purwokerto", "Bandung", "Surabaya", "Yogyakarta"];
  const searchQueries = ["Mau masak apa hari ini?", "Sayur bayam segar", "Bawang merah", "Buah mangga manis", "Daging sapi lada hitam"];
  
  const locationPlaceholder = useTypewriter(locationLocations, 100, 50, 2500);
  const searchPlaceholder = useTypewriter(searchQueries, 80, 40, 3000);

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/katalog?q=${encodeURIComponent(searchValue)}`);
    } else {
      navigate('/katalog');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    // Fetch products for the featured section
    api.get('/products')
      .then(response => {
        const resData = response.data;
        const listData = Array.isArray(resData) ? resData : (resData?.data || []);
        
        // Just take the first 8 products for the homepage (2 rows)
        setFeaturedProducts(listData.slice(0, 8));
        setLoading(false);
      })
      .catch(error => {
        console.error("Gagal memuat produk unggulan:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-layout">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container hero-container">
            <div className="hero-content">
              {/* <span className="badge">100% Organik & Segar</span> */}
              <h1 className="hero-title">
                Belanja Sayur Segar <br/> 
                <span className="text-primary">Langsung dari Petani</span>
              </h1>
              <p className="hero-subtitle">
                Bikin setiap harimu sesantai <em>Saturday</em> dengan <strong>Sayur-day</strong>! Kami mengantar sayur dan buah segar berkualitas dari kebun petani lokal langsung ke dapurmu di hari yang sama.
              </p>
              <div className="hero-search-bar">
                <div className="search-input-group location-group">
                  <IconMapPin size={20} className="search-icon" />
                  <input type="text" placeholder={locationPlaceholder} className="search-input" />
                </div>
                <div className="search-divider"></div>
                <div className="search-input-group query-group">
                  <IconSearch size={20} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder={searchPlaceholder} 
                    className="search-input" 
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <button className="btn btn-primary search-btn" onClick={handleSearch}>Cari Sayur</button>
              </div>
            </div>
            
            <div className="hero-image-wrapper">
              <div className="hero-blob">
                <div className="floating-item item-1"><IconLeaf size={48} color="var(--primary)" /></div>
                <div className="floating-item item-2"><IconLemon size={40} color="#f59e0b" /></div>
                <div className="floating-item item-3"><IconCarrot size={56} color="#f97316" /></div>
                <div className="floating-item item-4"><IconMushroom size={48} color="#8b5cf6" /></div>
                <div className="hero-main-visual"><IconBasket size={120} color="var(--primary-hover)" /></div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="featured-section">
          <div className="container">
            <div className="section-header text-center">
              <h2 className="section-title">Sayuran Segar Hari Ini</h2>
              <p className="section-subtitle">Pilihan terbaik yang baru saja dipanen khusus untuk Anda.</p>
            </div>
            
            {loading ? (
              <div className="text-center text-gray">Memuat produk...</div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center text-gray card" style={{padding: '2rem'}}>Belum ada produk tersedia.</div>
            ) : (
              <div className="product-grid">
                {featuredProducts.map(product => (
                  <div key={product.id} className="product-card card">
                    {product.image ? (
                      <div className="product-image-wrapper">
                        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
                      </div>
                    ) : (
                      <div className="product-image-placeholder">
                        <IconPackage size={64} color="var(--text-gray)" />
                      </div>
                    )}
                    <div className="product-info">
                      <span className="product-category">{product.category || 'Umum'}</span>
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-stock">Tersedia: {product.stock || 0} {product.unit || 'pcs'}</p>
                      
                      <div className="product-bottom">
                        <span className="product-price">
                          Rp {(product.price || 0).toLocaleString('id-ID')}
                          <span className="product-unit">/{product.unit || 'pcs'}</span>
                        </span>
                        <button onClick={() => addToCart(product)} className="btn btn-primary btn-sm">Beli</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-center mt-xl">
              <Link to="/katalog" className="btn btn-outline">Lihat Semua Produk di Katalog →</Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <div className="section-header text-center">
              <h2 className="section-title">Kenapa Belanja di Sayur-day?</h2>
              <p className="section-subtitle">Komitmen kami untuk memberikan pengalaman belanja kebutuhan dapur terbaik.</p>
            </div>
            
            <div className="features-grid">
              <div className="feature-card card">
                <div className="feature-icon"><IconPlant size={48} color="var(--primary)" /></div>
                <h3>Segar Setiap Hari</h3>
                <p>Sayuran dan buah-buahan dipanen langsung di pagi hari sebelum dikirim ke rumah Anda.</p>
              </div>
              <div className="feature-card card">
                <div className="feature-icon"><IconCoin size={48} color="var(--primary)" /></div>
                <h3>Harga Terbaik</h3>
                <p>Tanpa banyak perantara, kami memberikan harga yang adil untuk Anda dan petani lokal.</p>
              </div>
              <div className="feature-card card">
                <div className="feature-icon"><IconRocket size={48} color="var(--primary)" /></div>
                <h3>Pengiriman Cepat</h3>
                <p>Pesan sebelum jam 10 pagi, barang sampai di hari yang sama untuk menjaga kesegaran.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-card text-center">
              <h2>Weekend vibes, everyday freshness!</h2>
              <p>Nikmati santainya belanja ala <em>Saturday</em> setiap saat dengan <strong>Sayur-day</strong>. Tinggal pilih, klik, dan kami antar produk segar favoritmu sampai depan pintu.</p>
              <Link to="/katalog" className="btn btn-primary btn-lg mt-md">
                Lihat Katalog Produk
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer text-center text-gray">
        <div className="container">
          <p>&copy; 2026 Sayur-day UMKM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
