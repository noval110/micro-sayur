import React from 'react';
import {
  Link,
  useNavigate
} from 'react-router-dom';

import Navbar from '../components/Navbar';

import {
  IconArrowLeft,
  IconArrowRight,
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconTrash,
  IconTruck
} from '@tabler/icons-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import './CartCheckout.css';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80';

export default function Cart() {
  const { isAuthenticated } = useAuth();

  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/checkout'
        }
      });
      return;
    }

    navigate('/checkout');
  };

  const items = Array.isArray(cartItems)
    ? cartItems
    : [];

  const subtotal = items.reduce(
    (total, item) => {
      const price = Number(
        item.price || 0
      );

      const quantity = Number(
        item.quantity || 1
      );

      return total + price * quantity;
    },
    0
  );

  const shippingCost =
    subtotal > 0 &&
    subtotal <= 100000
      ? 5000
      : 0;

  const grandTotal =
    subtotal + shippingCost;

  const totalItems = items.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 1),
    0
  );

  const handleIncrease = (item) => {
    const quantity = Number(
      item.quantity || 1
    );

    const stock = Number(
      item.stock || 0
    );

    if (
      stock > 0 &&
      quantity >= stock
    ) {
      return;
    }

    updateQuantity(item.id, 1);
  };

  const handleDecrease = (item) => {
    updateQuantity(item.id, -1);
  };

  return (
    <div className="cc-page">
      <Navbar />

      <main className="cc-container">
        <div className="cc-page-header">
          <div>
            <span className="cc-eyebrow">
              Keranjang Belanja
            </span>

            <h1>
              Keranjang Saya
            </h1>

            <p>
              {totalItems} item sudah
              siap untuk diproses.
            </p>
          </div>

          {items.length > 0 && (
            <Link
              to="/katalog"
              className="cc-back-link"
            >
              <IconArrowLeft size={16} />

              Lanjut Belanja
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <section className="cc-empty">
            <div className="cc-empty-icon">
              <IconShoppingBag
                size={42}
              />
            </div>

            <h2>
              Keranjangmu masih kosong
            </h2>

            <p>
              Tambahkan produk segar
              dari katalog Sayur-day
              terlebih dahulu.
            </p>

            <Link
              to="/katalog"
              className="cc-primary-button"
            >
              Mulai Belanja

              <IconArrowRight
                size={17}
              />
            </Link>
          </section>
        ) : (
          <div className="cc-layout">

            {/* LEFT */}

            <section className="cc-card cc-cart-card">
              <div className="cc-card-header">
                <div>
                  <h2>
                    Daftar Produk
                  </h2>

                  <p>
                    Atur jumlah produk
                    sebelum checkout.
                  </p>
                </div>

                <button
                  type="button"
                  className="cc-clear-button"
                  onClick={clearCart}
                >
                  <IconTrash size={15} />

                  Kosongkan
                </button>
              </div>

              <div className="cc-cart-list">
                {items.map(
                  (item, index) => {
                    const price =
                      Number(
                        item.price || 0
                      );

                    const quantity =
                      Number(
                        item.quantity || 1
                      );

                    const stock =
                      Number(
                        item.stock || 0
                      );

                    return (
                      <article
                        key={`cart-${item.id}-${index}`}
                        className="cc-cart-item"
                      >
                        <div className="cc-item-image">
                          <img
                            src={
                              item.image ||
                              FALLBACK_IMG
                            }
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.onerror =
                                null;

                              e.currentTarget.src =
                                FALLBACK_IMG;
                            }}
                          />
                        </div>

                        <div className="cc-item-content">
                          <div className="cc-item-top">
                            <div>
                              <span className="cc-item-unit">
                                {item.unit ||
                                  'kg'}
                              </span>

                              <h3>
                                {item.name}
                              </h3>

                              <div className="cc-item-price">
                                Rp{' '}
                                {price.toLocaleString(
                                  'id-ID'
                                )}

                                <span>
                                  /
                                  {item.unit ||
                                    'kg'}
                                </span>
                              </div>

                              {stock > 0 && (
                                <small className="cc-stock">
                                  Stok: {stock}
                                </small>
                              )}
                            </div>

                            <button
                              type="button"
                              className="cc-remove-button"
                              onClick={() =>
                                removeFromCart(
                                  item.id
                                )
                              }
                              aria-label="Hapus produk"
                            >
                              <IconTrash
                                size={17}
                              />
                            </button>
                          </div>

                          <div className="cc-item-bottom">
                            <div className="cc-quantity">
                              <button
                                type="button"
                                onClick={() =>
                                  handleDecrease(
                                    item
                                  )
                                }
                              >
                                <IconMinus
                                  size={14}
                                />
                              </button>

                              <span>
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  handleIncrease(
                                    item
                                  )
                                }
                                disabled={
                                  stock > 0 &&
                                  quantity >=
                                    stock
                                }
                              >
                                <IconPlus
                                  size={14}
                                />
                              </button>
                            </div>

                            <strong className="cc-item-subtotal">
                              Rp{' '}
                              {(
                                price *
                                quantity
                              ).toLocaleString(
                                'id-ID'
                              )}
                            </strong>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </section>

            {/* RIGHT */}

            <aside className="cc-sidebar">
              <div className="cc-card cc-summary">
                <h2>
                  Ringkasan Belanja
                </h2>

                <div className="cc-summary-list">
                  <div>
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      Rp{' '}
                      {subtotal.toLocaleString(
                        'id-ID'
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Ongkos Kirim
                    </span>

                    <strong
                      className={
                        shippingCost === 0
                          ? 'cc-free'
                          : ''
                      }
                    >
                      {shippingCost === 0
                        ? 'Gratis'
                        : `Rp ${shippingCost.toLocaleString(
                            'id-ID'
                          )}`}
                    </strong>
                  </div>
                </div>

                <div className="cc-divider" />

                <div className="cc-total">
                  <div>
                    <span>
                      Total
                    </span>

                    <small>
                      Estimasi pembayaran
                    </small>
                  </div>

                  <strong>
                    Rp{' '}
                    {grandTotal.toLocaleString(
                      'id-ID'
                    )}
                  </strong>
                </div>

                <button
                  type="button"
                  className="cc-primary-button cc-full-button"
                  onClick={handleCheckout}
                >
                  Lanjut Checkout

                  <IconArrowRight
                    size={17}
                  />
                </button>

                <div className="cc-info-box">
                  <IconTruck
                    size={19}
                  />

                  <p>
                    Gratis ongkir untuk
                    transaksi di atas
                    Rp100.000.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
