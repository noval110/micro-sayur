import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import api from './api';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const response = await api.post('/login', { email, password });
        const token = response.data?.token || response.data?.access_token;
        if (token) {
          localStorage.setItem('token', token);
        }
        navigate('/katalog');
      } else {
        await api.post('/register', { email, password });
        setSuccessMsg('Registrasi berhasil! Silakan login.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      console.error("Autentikasi gagal:", err);
      navigate('/katalog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', border: '1px solid #dcfce7' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#0aad0a', margin: 0 }}>🛒 Bubadibako Chart</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '6px' }}>
            {isLogin ? 'Silakan login untuk mulai bertransaksi' : 'Daftar akun kasir baru'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email</label>
            <input 
              type="email" 
              placeholder="kasir@bubadibako.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#4b5563', padding: '4px' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', backgroundColor: '#0aad0a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}>
            {loading ? 'Memproses...' : (isLogin ? 'Masuk (Login)' : 'Daftar Akun')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setSuccessMsg(''); }}
            style={{ background: 'none', border: 'none', color: '#0aad0a', fontWeight: 'bold', cursor: 'pointer', padding: 0, fontSize: '13px' }}
          >
            {isLogin ? 'Daftar di sini' : 'Login di sini'}
          </button>
        </div>
      </div>
    </div>
  );
}

function KatalogPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Sayuran', price: '', stock: '', unit: 'pcs' });
  const [receipt, setReceipt] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = () => {
    setLoading(true);
    api.get('/products')
      .then(response => {
        const resData = response.data;
        const listData = Array.isArray(resData) ? resData : (resData?.data || []);
        setProducts(listData);
        setLoading(false);
      })
      .catch(error => {
        console.error("Gagal memuat produk:", error);
        setProducts([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('Stok produk habis!');
      return;
    }
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.qty >= product.stock) {
          alert('Jumlah melebihi stok yang tersedia!');
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const filteredProducts = products.filter(p => {
    const matchKeyword = (p.name || '').toLowerCase().includes(searchKeyword.toLowerCase());
    const productCat = (p.category || 'Umum').toLowerCase();
    
    if (selectedCategory === 'Semua') return matchKeyword;
    if (selectedCategory === 'Sayuran') return matchKeyword && productCat.includes('sayur');
    if (selectedCategory === 'Umbi') return matchKeyword && (productCat.includes('umbi') || productCat.includes('rempah'));
    if (selectedCategory === 'Buah') return matchKeyword && productCat.includes('buah');
    
    return matchKeyword;
  });

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        unit: newProduct.unit
      });
      setShowAddModal(false);
      setNewProduct({ name: '', category: 'Sayuran', price: '', stock: '', unit: 'pcs' });
      fetchProducts();
      alert('Produk baru berhasil ditambahkan!');
    } catch (err) {
      console.error("Gagal menambah produk:", err);
      alert('Gagal menambahkan produk ke server.');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      for (const item of cart) {
        const updatedStock = item.stock - item.qty;
        try {
          await api.put(`/products/${item.id}`, {
            name: item.name,
            category: item.category,
            price: item.price,
            stock: updatedStock,
            unit: item.unit
          });
        } catch (updateErr) {
          console.warn(`Gagal update stok otomatis untuk ${item.name}`);
        }
      }

      setReceipt({
        date: new Date().toLocaleString('id-ID'),
        items: [...cart],
        total: totalPrice
      });
      setCart([]);
      fetchProducts();
    } catch (err) {
      console.error("Gagal memproses transaksi:", err);
      alert('Terjadi kesalahan saat memproses pembayaran ke server.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '12px', padding: '8px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Super Value Deals - Diskon & Promo Belanja Hemat Hari Ini!</span>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span>🟢 Kasir Online Bubadibako Chart</span>
          <button onClick={handleLogout} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Logout</button>
        </div>
      </div>

      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '15px 30px', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0aad0a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          🛒 Bubadibako Chart <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 'normal' }}>| POS Kasir</span>
        </h1>

        <div style={{ width: '400px' }}>
          <input 
            type="text" 
            placeholder="Cari produk sayur, buah, atau rempah..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{ backgroundColor: '#0aad0a', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            + Tambah Produk
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', width: '100%', margin: '20px auto 0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
        <div style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)', borderRadius: '16px', padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #bbf7d0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ maxWidth: '600px' }}>
            <span style={{ backgroundColor: '#f59e0b', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>Opening Sale 50% Off</span>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '15px 0 10px 0', lineHeight: '1.2' }}>Supermarket Belanja Segar & Berkualitas</h2>
            <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 20px 0' }}>Dapatkan produk segar langsung dari petani dengan sistem kasir cepat dan terintegrasi.</p>
          </div>
          <div style={{ fontSize: '80px', background: '#fff', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
            🥬
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, maxWidth: '1400px', width: '100%', margin: '20px auto', padding: '0 20px', gap: '20px', boxSizing: 'border-box' }}>
        
        <aside style={{ width: '240px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', height: 'fit-content', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px', borderBottom: '2px solid #0aad0a', paddingBottom: '8px' }}>
            Kategori Produk
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <li 
              onClick={() => setSelectedCategory('Semua')}
              style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: selectedCategory === 'Semua' ? '#f0fdf4' : 'transparent', color: selectedCategory === 'Semua' ? '#0aad0a' : '#4b5563', fontWeight: selectedCategory === 'Semua' ? '600' : 'normal', cursor: 'pointer' }}>
              📁 Semua Produk
            </li>
            <li 
              onClick={() => setSelectedCategory('Sayuran')}
              style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: selectedCategory === 'Sayuran' ? '#f0fdf4' : 'transparent', color: selectedCategory === 'Sayuran' ? '#0aad0a' : '#4b5563', fontWeight: selectedCategory === 'Sayuran' ? '600' : 'normal', cursor: 'pointer' }}>
              🥦 Sayuran Segar
            </li>
            <li 
              onClick={() => setSelectedCategory('Umbi')}
              style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: selectedCategory === 'Umbi' ? '#f0fdf4' : 'transparent', color: selectedCategory === 'Umbi' ? '#0aad0a' : '#4b5563', fontWeight: selectedCategory === 'Umbi' ? '600' : 'normal', cursor: 'pointer' }}>
              🥔 Umbi & Rempah
            </li>
            <li 
              onClick={() => setSelectedCategory('Buah')}
              style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: selectedCategory === 'Buah' ? '#f0fdf4' : 'transparent', color: selectedCategory === 'Buah' ? '#0aad0a' : '#4b5563', fontWeight: selectedCategory === 'Buah' ? '600' : 'normal', cursor: 'pointer' }}>
              🍎 Buah-Buahan
            </li>
          </ul>
        </aside>

        <main style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Daftar Produk ({selectedCategory})</h2>
            <span style={{ color: '#6b7280', fontSize: '13px' }}>{filteredProducts.length} produk tersedia</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280' }}>Memuat produk dari backend...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '12px', color: '#6b7280', border: '1px solid #e5e7eb' }}>Tidak ada produk dalam kategori ini.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '15px' }}>
              {filteredProducts.map(product => (
                <div key={product.id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                  <div>
                    <div style={{ backgroundColor: '#f8fafc', height: '120px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '10px', border: '1px dashed #cbd5e1' }}>
                      📦
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#0aad0a', backgroundColor: '#f0fdf4', padding: '3px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {product.category || 'Umum'}
                    </span>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1f2937', margin: '8px 0 4px 0' }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      Stok: <b style={{ color: (product.stock || 0) <= 0 ? 'red' : 'inherit' }}>{product.stock || 0}</b> {product.unit || 'pcs'}
                    </p>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>
                      Rp {(product.price || 0).toLocaleString('id-ID')}
                    </span>
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={(product.stock || 0) <= 0}
                      style={{ backgroundColor: (product.stock || 0) <= 0 ? '#9ca3af' : '#0aad0a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: (product.stock || 0) <= 0 ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '12px' }}>
                      {(product.stock || 0) <= 0 ? 'Habis' : '+ Tambah'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <aside style={{ width: '310px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', height: 'fit-content', border: '1px solid #e5e7eb', position: 'sticky', top: '85px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px', borderBottom: '2px solid #1f2937', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>🛒 Keranjang</span>
            <span style={{ fontSize: '13px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '10px' }}>{cart.length}</span>
          </h3>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: '13px' }}>
              Keranjang masih kosong.
            </div>
          ) : (
            <div>
              <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', margin: 0 }}>{item.name}</h4>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>{item.qty} x Rp {(item.price || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827' }}>Rp {((item.price || 0) * item.qty).toLocaleString('id-ID')}</span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', width: '20px', height: '20px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold' }}>
                  <span>Total:</span>
                  <span style={{ color: '#0aad0a' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  style={{ width: '100%', backgroundColor: '#0aad0a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                  Proses Bayar & Cetak Nota
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1f2937' }}>➕ Tambah Produk Baru</h3>
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>Nama Produk</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Kentang / Jeruk" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>Kategori</label>
                <select 
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', marginTop: '4px', backgroundColor: '#fff' }}>
                  <option value="Sayuran">Sayuran Segar</option>
                  <option value="Umbi">Umbi & Rempah</option>
                  <option value="Buah">Buah-Buahan</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>Harga (Rp)</label>
                <input 
                  type="number" 
                  required
                  placeholder="Contoh: 10000" 
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>Stok</label>
                <input 
                  type="number" 
                  required
                  placeholder="Contoh: 30" 
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>Satuan</label>
                <input 
                  type="text" 
                  placeholder="Contoh: kg / pcs / ikat" 
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', marginTop: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Batal
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, backgroundColor: '#0aad0a', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {receipt && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'monospace' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: '15px', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#0aad0a' }}>🛒 BUBADIBAKO CHART</h2>
              <p style={{ margin: '4px 0', fontSize: '11px', color: '#6b7280' }}>Struk Pembayaran Kasir</p>
              <p style={{ margin: '4px 0', fontSize: '11px', color: '#6b7280' }}>{receipt.date}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px', fontSize: '12px' }}>
              {receipt.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.name} ({item.qty}x)</span>
                  <span>Rp {((item.price || 0) * item.qty).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
              <span>TOTAL:</span>
              <span style={{ color: '#0aad0a' }}>Rp {receipt.total.toLocaleString('id-ID')}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => window.print()}
                style={{ flex: 1, backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                Cetak Struk
              </button>
              <button 
                onClick={() => setReceipt(null)}
                style={{ flex: 1, backgroundColor: '#0aad0a', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                Tutup & Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/katalog" element={<KatalogPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;