import React, { useState, useEffect } from 'react';
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons-react';
import api from '../../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sayuran',
    price: '',
    stock: '',
    unit: 'ikat',
    image: '',
    rating: 5.0
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setProducts(data);
    } catch (err) {
      console.error("Gagal memuat produk", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'rating' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', formData);
      setIsModalOpen(false);
      setFormData({ name: '', category: 'Sayuran', price: '', stock: '', unit: 'ikat', image: '', rating: 5.0 });
      fetchProducts(); // Refresh list
    } catch (err) {
      alert("Gagal menambah produk");
      console.error(err);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Daftar Produk</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <IconPlus size={20} /> Tambah Produk
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Gambar</th>
                <th style={{ padding: '1rem' }}>Nama Produk</th>
                <th style={{ padding: '1rem' }}>Kategori</th>
                <th style={{ padding: '1rem' }}>Harga</th>
                <th style={{ padding: '1rem' }}>Stok</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Memuat...</td></tr>
              ) : products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-gray)' }}>#{product.id}</td>
                  <td style={{ padding: '1rem' }}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{product.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', backgroundColor: 'var(--bg-main)', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {product.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>Rp {product.price?.toLocaleString()} / {product.unit}</td>
                  <td style={{ padding: '1rem' }}>{product.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Product */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Tambah Produk Baru</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nama Produk</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Kategori</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="Sayuran">Sayuran</option>
                    <option value="Buah">Buah</option>
                    <option value="Bumbu">Bumbu</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Satuan</label>
                  <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Harga (Rp)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Stok</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>URL Gambar</label>
                <input type="text" name="image" value={formData.image} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem', border: '1px solid #ccc', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Simpan Produk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
