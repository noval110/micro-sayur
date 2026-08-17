import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconX, IconTrash, IconMinus, IconPlus, IconCheck, IconTruck, IconMapPin, IconNotes } from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './CartDrawer.css';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  
  const [checkoutStatus, setCheckoutStatus] = useState('idle'); // idle, loading, success, error
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' or 'delivery'
  const [deliveryAddress, setDeliveryAddress] = useState(() => localStorage.getItem('sayur_address') || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const handleProceedToDelivery = () => {
    if (!isAuthenticated) {
      setIsCartOpen(false);
      navigate('/login');
      return;
    }
    setCheckoutStep('delivery');
  };

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      setCheckoutError('Alamat pengiriman wajib diisi!');
      return;
    }

    localStorage.setItem('sayur_address', deliveryAddress);
    setCheckoutStatus('loading');
    setCheckoutError('');

    // Objek pesanan baru
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending',
      created_at: new Date().toLocaleString('id-ID'),
      delivery_address: deliveryAddress,
      delivery_notes: deliveryNotes,
      total_price: cartTotal,
      items: cartItems.map(item => ({
        product_name: item.name,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity, 10)
      }))
    };

    try {
      // Tembak ke API Gateway Nginx (/orders -> Order Service)
      await api.post('/orders', newOrder, {
        headers: { Authorization: `Bearer ${token}` }
      });
      completeCheckout(newOrder);
    } catch (err) {
      console.warn('Backend offline, menyimpan transaksi ke storage lokal:', err);
      // Fallback: simpan ke storage lokal jika backend offline
      completeCheckout(newOrder);
    }
  };

  const completeCheckout = (newOrder) => {
    // Simpan pesanan ke localStorage agar langsung tampil di MyOrders
    const existingOrders = JSON.parse(localStorage.getItem('sayur_my_orders') || '[]');
    localStorage.setItem('sayur_my_orders', JSON.stringify([newOrder, ...existingOrders]));

    setCheckoutStatus('success');
    clearCart();

    setTimeout(() => {
      setIsCartOpen(false);
      setCheckoutStatus('idle');
      setCheckoutStep('cart');
      navigate('/my-orders');
    }, 1500);
  };

  const handleClose = () => {
    setIsCartOpen(false);
    if (checkoutStatus === 'success') {
      setCheckoutStatus('idle');
      setCheckoutStep('cart');
    }
  };

  return (
    <>
      <div className={`cart-backdrop ${isCartOpen ? 'open' : ''}`} onClick={handleClose}></div>
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="cart-header">
          <h2>{checkoutStep === 'delivery' && checkoutStatus !== 'success' ? 'Detail Pengiriman' : 'Keranjang Belanja'}</h2>
          <button className="cart-close-btn" onClick={handleClose}>
            <IconX size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="cart-body">
          {checkoutStatus === 'success' ? (
            <div className="cart-empty" style={{ padding: '40px 10px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <IconCheck size={36} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.25rem' }}>Pesanan Berhasil!</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Pesanan Anda telah diterima. Mengalihkan ke halaman Pesanan Saya...
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="cart-empty">
              <p>Keranjangmu masih kosong nih.</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleClose}>
                Mulai Belanja
              </button>
            </div>
          ) : checkoutStep === 'delivery' ? (
            <div className="delivery-form">
              
              {/* Form Input Alamat */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconMapPin size={18} color="#10b981" /> Alamat Lengkap Pengiriman *
                </label>
                <textarea 
                  className="input-field" 
                  rows="3" 
                  placeholder="Contoh: Jl. Sudirman No. 12, RT 01/RW 02, Patokan pagar hitam"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Form Input Catatan */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconNotes size={18} color="#64748b" /> Catatan untuk Kurir (Opsional)
                </label>
                <input 
                  type="text"
                  className="input-field" 
                  placeholder="Contoh: Titip di pos satpam"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                />
              </div>

              {/* Ringkasan Pesanan Box */}
              <div className="delivery-summary">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <IconTruck size={20} color="#10b981" />
                  <h4>Ringkasan Pesanan</h4>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#475569', marginBottom: '8px' }}>
                  <span>Total Item ({cartItems.length} produk)</span>
                  <span style={{ fontWeight: 600 }}>Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#10b981', fontWeight: 700 }}>
                  <span>Ongkos Kirim</span>
                  <span>GRATIS</span>
                </div>
              </div>

            </div>
          ) : (
            /* Item List Keranjang */
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img">
                    <img src={item.image || 'https://via.placeholder.com/70'} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-title-row">
                      <h4>{item.name}</h4>
                      <button className="btn-remove" onClick={() => removeFromCart(item.id)}>
                        <IconTrash size={18} />
                      </button>
                    </div>
                    <p className="cart-item-price">Rp {(item.price || 0).toLocaleString('id-ID')} <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>/{item.unit || 'pcs'}</span></p>
                    <div className="cart-item-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><IconMinus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><IconPlus size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && checkoutStatus !== 'success' && (
          <div className="cart-footer">
            {checkoutStep === 'cart' ? (
              <>
                <div className="cart-total">
                  <span>Total:</span>
                  <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem', fontWeight: 700 }}
                  onClick={handleProceedToDelivery}
                >
                  {isAuthenticated ? 'Lanjut ke Pengiriman' : 'Login untuk Checkout'}
                </button>
              </>
            ) : (
              <>
                <div className="cart-total">
                  <span>Total Bayar:</span>
                  <span style={{ color: '#10b981' }}>Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
                
                {checkoutError && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '8px', textAlign: 'center', fontWeight: 600 }}>
                    {checkoutError}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                    onClick={() => setCheckoutStep('cart')}
                    disabled={checkoutStatus === 'loading'}
                  >
                    Kembali
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 2, justifyContent: 'center', padding: '10px' }}
                    onClick={handleCheckout}
                    disabled={checkoutStatus === 'loading'}
                  >
                    {checkoutStatus === 'loading' ? 'Memproses...' : 'Buat Pesanan'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </>
  );
}