import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconX, IconTrash, IconMinus, IconPlus, IconCheck } from '@tabler/icons-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './CartDrawer.css';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const [checkoutStatus, setCheckoutStatus] = React.useState('idle'); // idle, loading, success, error
  const [checkoutError, setCheckoutError] = React.useState('');

  // Drawer always renders to allow CSS transitions to play smoothly
  const [checkoutStep, setCheckoutStep] = React.useState('cart'); // 'cart' or 'delivery'
  const [deliveryAddress, setDeliveryAddress] = React.useState(() => localStorage.getItem('sayur_address') || '');
  const [deliveryNotes, setDeliveryNotes] = React.useState('');

  if (!isCartOpen) {
    // Reset step when closed
    if (checkoutStep !== 'cart') setTimeout(() => setCheckoutStep('cart'), 300);
  }

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
      setCheckoutError('Alamat pengiriman wajib diisi');
      return;
    }

    localStorage.setItem('sayur_address', deliveryAddress);
    setCheckoutStatus('loading');
    setCheckoutError('');

    try {
      const payload = {
        user_id: user.id,
        delivery_address: deliveryAddress,
        delivery_notes: deliveryNotes,
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity, 10)
        }))
      };

      await api.post('/orders', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCheckoutStatus('success');
      clearCart();
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setIsCartOpen(false);
        setCheckoutStatus('idle');
        setCheckoutStep('cart');
      }, 3000);

    } catch (err) {
      console.error(err);
      setCheckoutStatus('error');
      setCheckoutError('Gagal membuat pesanan. Coba lagi.');
    }
  };

  return (
    <>
      <div className={`cart-backdrop ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>{checkoutStep === 'delivery' && checkoutStatus !== 'success' ? 'Detail Pengiriman' : 'Keranjang Belanja'}</h2>
          <button className="cart-close-btn" onClick={() => {
            setIsCartOpen(false);
            if (checkoutStatus === 'success') setCheckoutStatus('idle');
          }}>
            <IconX size={24} />
          </button>
        </div>
        
        <div className="cart-body">
          {checkoutStatus === 'success' ? (
            <div className="cart-empty" style={{ color: 'var(--primary)' }}>
              <IconCheck size={64} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Pesanan Berhasil!</h3>
              <p>Sayuran segar Anda akan segera diantar ke depan rumah. Kurir kami akan menghubungi Anda.</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="cart-empty">
              <p>Keranjangmu masih kosong nih.</p>
              <button className="btn btn-primary mt-md" onClick={() => setIsCartOpen(false)}>
                Mulai Belanja
              </button>
            </div>
          ) : checkoutStep === 'delivery' ? (
            <div className="delivery-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Alamat Lengkap Pengiriman *</label>
                <textarea 
                  className="input-field" 
                  rows="3" 
                  placeholder="Contoh: Jl. Sudirman No. 12, RT 01/RW 02, Patokan pagar hitam"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Catatan untuk Kurir (Opsional)</label>
                <input 
                  type="text"
                  className="input-field" 
                  placeholder="Contoh: Titip di pos satpam"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                />
              </div>
              <div className="delivery-summary" style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Ringkasan Pesanan</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Total Item ({cartTotal / cartTotal /* just to mock */ || cartItems.length} produk)</span>
                  <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: '600' }}>
                  <span>Ongkos Kirim</span>
                  <span>GRATIS</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-title-row">
                      <h4>{item.name}</h4>
                      <button className="btn-remove" onClick={() => removeFromCart(item.id)}>
                        <IconTrash size={18} />
                      </button>
                    </div>
                    <p className="cart-item-price">Rp {item.price.toLocaleString('id-ID')} <span style={{fontSize: '0.8rem', color: 'var(--text-gray)'}}>/{item.unit}</span></p>
                    <div className="cart-item-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><IconMinus size={16} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><IconPlus size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cartItems.length > 0 && checkoutStatus !== 'success' && (
          <div className="cart-footer">
            {checkoutStep === 'cart' ? (
              <>
                <div className="cart-total">
                  <span>Total:</span>
                  <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
                <button 
                  className="btn btn-primary w-full" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleProceedToDelivery}
                >
                  {isAuthenticated ? 'Lanjut ke Pengiriman' : 'Login untuk Checkout'}
                </button>
              </>
            ) : (
              <>
                <div className="cart-total">
                  <span>Total Bayar:</span>
                  <span style={{ color: 'var(--primary)' }}>Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
                {checkoutStatus === 'error' && (
                  <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                    {checkoutError}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setCheckoutStep('cart')}
                    disabled={checkoutStatus === 'loading'}
                  >
                    Kembali
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 2, justifyContent: 'center' }}
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
