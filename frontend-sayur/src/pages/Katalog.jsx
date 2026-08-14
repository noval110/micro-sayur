import React, { useState, useEffect, useMemo } from 'react';
import { IconSearch, IconFilter, IconPackage } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api';
import Navbar from '../components/Navbar';
import './Katalog.css';

export default function Katalog() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  
  const { addToCart } = useCart();

  useEffect(() => {
    // Fetch products
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/products');
        const resData = res.data;
        const listData = Array.isArray(resData) ? resData : (resData?.data || []);
        setProducts(listData);
      } catch (err) {
        console.error("Gagal mengambil data produk:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filter products based on search query and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const categories = ['Semua', 'Sayuran', 'Buah', 'Bumbu'];

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <main className="katalog-page container">
        <div className="katalog-header">
          <div className="katalog-title">
            <h1>Katalog Produk</h1>
            <p>Pilih dari ratusan bahan pangan segar berkualitas dari petani lokal.</p>
          </div>
          
          <div className="katalog-controls">
            <div className="search-bar">
              <IconSearch size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Cari sayur, buah, atau bumbu..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="category-filters">
          <IconFilter size={20} color="var(--text-gray)" />
          <div className="category-chips">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray mt-xl">Memuat produk...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state card">
            <IconPackage size={64} color="var(--text-gray)" />
            <h3>Oops, produk tidak ditemukan!</h3>
            <p>Coba gunakan kata kunci lain atau ubah filter kategori.</p>
            <button className="btn btn-outline mt-md" onClick={() => { setSearchQuery(''); setSelectedCategory('Semua'); }}>
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(product => (
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
                    <button className="btn btn-primary btn-sm" onClick={() => addToCart(product)}>Beli</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
