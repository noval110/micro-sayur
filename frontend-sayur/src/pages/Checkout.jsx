import React, {
  useEffect,
  useState
} from 'react';

import {
  Link,
  useNavigate
} from 'react-router-dom';

import Navbar from '../components/Navbar';
import api from '../api';

import {
  useCart
} from '../context/CartContext';

import {
  useAuth
} from '../context/AuthContext';

import {
  IconArrowLeft,
  IconCircleCheck,
  IconLoader2,
  IconLock,
  IconMapPin,
  IconNotes,
  IconPhone,
  IconShoppingBag,
  IconTruck,
  IconUser
} from '@tabler/icons-react';

import './CartCheckout.css';


const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80';


export default function Checkout() {
  const {
    cartItems,
    clearCart
  } = useCart();

  const {
    user,
    token,
    isAuthenticated
  } = useAuth();

  const navigate =
    useNavigate();


  // =========================================
  // FORM
  // =========================================

  const [
    address,
    setAddress
  ] = useState(() => {
    return (
      localStorage.getItem(
        'sayur_address'
      ) || ''
    );
  });

  const [
    phone,
    setPhone
  ] = useState('');

  const [
    profileName,
    setProfileName
  ] = useState('');

  const [
    note,
    setNote
  ] = useState('');


  // =========================================
  // STATE
  // =========================================

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    profileLoading,
    setProfileLoading
  ] = useState(true);

  const [
    profileLoaded,
    setProfileLoaded
  ] = useState(false);

  const [
    error,
    setError
  ] = useState('');

  const [
    createdOrder,
    setCreatedOrder
  ] = useState(null);


  // =========================================
  // PRODUCT ID HELPER
  // =========================================

  const getProductId = (
    item
  ) => {
    if (!item) {
      return null;
    }

    const candidates = [
      item.product_id,
      item.productId,
      item.id,
      item.ID,
      item.product?.id,
      item.product?.ID,
      item.ProductID,
      item.ProductId
    ];

    const rawId =
      candidates.find(
        (value) =>
          value !== undefined &&
          value !== null &&
          value !== ''
      );

    if (
      rawId === undefined ||
      rawId === null ||
      rawId === ''
    ) {
      return null;
    }

    const numericId =
      Number(rawId);

    if (
      !Number.isInteger(
        numericId
      ) ||
      numericId <= 0
    ) {
      return null;
    }

    return numericId;
  };


  // =========================================
  // QUANTITY HELPER
  // =========================================

  const getQuantity = (
    item
  ) => {
    const quantity =
      Number(
        item?.quantity ??
          1
      );

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      return 1;
    }

    return quantity;
  };


  // =========================================
  // CART ITEMS
  // =========================================

  const rawItems =
    Array.isArray(
      cartItems
    )
      ? cartItems
      : [];


  // Hanya produk yang punya
  // ID database valid yang
  // boleh ikut checkout.
  const items =
    rawItems.filter(
      (item) =>
        getProductId(
          item
        ) !== null
    );


  // =========================================
  // AUTH
  // =========================================

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(
        '/login',
        {
          replace: true
        }
      );
    }
  }, [
    isAuthenticated,
    navigate
  ]);


  // =========================================
  // GET PROFILE
  // =========================================

  useEffect(() => {
    const fetchProfile =
      async () => {
        if (
          !isAuthenticated
        ) {
          setProfileLoading(
            false
          );

          return;
        }

        try {
          setProfileLoading(
            true
          );

          const response =
            await api.get(
              '/users/profile'
            );

          const profile =
            response.data?.data;

          if (!profile) {
            return;
          }

          setProfileLoaded(
            true
          );

          setProfileName(
            profile.name ||
              user?.name ||
              ''
          );

          setPhone(
            profile.phone ||
              ''
          );

          if (
            String(
              profile.address ||
                ''
            ).trim()
          ) {
            setAddress(
              String(
                profile.address
              ).trim()
            );
          }

        } catch (err) {
          console.error(
            'Gagal mengambil profil checkout:',
            err.response?.data ||
              err
          );

          setProfileName(
            user?.name ||
              ''
          );

        } finally {
          setProfileLoading(
            false
          );
        }
      };

    fetchProfile();

  }, [
    isAuthenticated,
    user?.name
  ]);


  // =========================================
  // TOTAL
  // =========================================

  const subtotal =
    items.reduce(
      (
        total,
        item
      ) => {
        const price =
          Number(
            item.price ||
              0
          );

        const quantity =
          getQuantity(
            item
          );

        return (
          total +
          price *
            quantity
        );
      },
      0
    );


  const shippingFee =
    subtotal > 0 &&
    subtotal <= 100000
      ? 5000
      : 0;


  const estimatedTotal =
    subtotal +
    shippingFee;


  // =========================================
  // CREATE ORDER
  // =========================================

  const handlePlaceOrder =
    async (
      event
    ) => {
      event.preventDefault();

      setError('');


      // =====================================
      // AUTH
      // =====================================

      if (
        !isAuthenticated
      ) {
        navigate(
          '/login'
        );

        return;
      }


      // =====================================
      // CART
      // =====================================

      if (
        items.length === 0
      ) {
        setError(
          'Tidak ada produk valid untuk dibuat menjadi pesanan.'
        );

        return;
      }


      // =====================================
      // ADDRESS
      // =====================================

      if (
        !address.trim()
      ) {
        setError(
          'Alamat pengiriman wajib diisi.'
        );

        return;
      }


      // =====================================
      // USER ID
      // =====================================

      const userId =
        Number(
          user?.id ||
          user?.ID
        );

      if (
        !Number.isInteger(
          userId
        ) ||
        userId <= 0
      ) {
        console.error(
          'User ID tidak valid:',
          user
        );

        setError(
          'Data akun tidak valid. Silakan login ulang.'
        );

        return;
      }


      // =====================================
      // ORDER ITEMS
      // =====================================

      const orderItems =
        items.map(
          (item) => ({
            product_id:
              getProductId(
                item
              ),

            quantity:
              getQuantity(
                item
              )
          })
        );


      // =====================================
      // PAYLOAD
      // =====================================

      const payload = {
        user_id:
          userId,

        delivery_address:
          address.trim(),

        delivery_notes:
          note.trim(),

        items:
          orderItems
      };


      console.log(
        'CREATE ORDER PAYLOAD:',
        payload
      );


      // =====================================
      // REQUEST
      // =====================================

      try {
        setLoading(true);

        const response =
          await api.post(
            '/orders',
            payload,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        const backendOrder =
          response.data?.data;


        if (!backendOrder) {
          throw new Error(
            'Server tidak mengembalikan data order.'
          );
        }


        localStorage.setItem(
          'sayur_address',
          address.trim()
        );


        setCreatedOrder(
          backendOrder
        );


        clearCart();

      } catch (err) {
        console.error(
          'Gagal membuat pesanan:',
          err.response?.data ||
            err
        );

        setError(
          err.response?.data
            ?.message ||
          err.response?.data
            ?.massage ||
          err.message ||
          'Gagal membuat pesanan. Silakan coba lagi.'
        );

      } finally {
        setLoading(false);
      }
    };


  // =========================================
  // SUCCESS
  // =========================================

  if (createdOrder) {
    return (
      <div className="cc-page">

        <Navbar />


        <main className="cc-container">

          <section className="cc-success">


            <div className="cc-success-icon">

              <IconCircleCheck
                size={48}
              />

            </div>


            <span className="cc-eyebrow">
              Pesanan diterima
            </span>


            <h1>
              Pesanan berhasil dibuat!
            </h1>


            <p>
              Order{' '}

              <strong>
                #{createdOrder.id}
              </strong>{' '}

              sudah tercatat di
              Sayur-day.
            </p>


            <div className="cc-success-info">


              <div>

                <span>
                  Nomor Order
                </span>

                <strong>
                  #{createdOrder.id}
                </strong>

              </div>


              <div>

                <span>
                  Status
                </span>

                <strong className="cc-status-pending">

                  {createdOrder.status ||
                    'PENDING'}

                </strong>

              </div>


              <div>

                <span>
                  Total
                </span>

                <strong>

                  Rp{' '}

                  {Number(
                    createdOrder.total_price ||
                      estimatedTotal
                  ).toLocaleString(
                    'id-ID'
                  )}

                </strong>

              </div>


              <div>

                <span>
                  Alamat
                </span>

                <strong>

                  {createdOrder.delivery_address ||
                    address}

                </strong>

              </div>


            </div>


            <div className="cc-success-note">

              <IconLock
                size={18}
              />

              <p>
                Pesanan masih berstatus
                PENDING. Lanjutkan
                pembayaran melalui
                halaman Pesanan Saya.
              </p>

            </div>


            <button
              type="button"
              className="cc-primary-button cc-success-button"
              onClick={() =>
                navigate(
                  '/my-orders'
                )
              }
            >
              Lihat Pesanan & Bayar
            </button>


          </section>

        </main>

      </div>
    );
  }


  // =========================================
  // EMPTY / NO VALID PRODUCT
  // =========================================

  if (
    items.length === 0 &&
    !createdOrder
  ) {
    return (
      <div className="cc-page">

        <Navbar />


        <main className="cc-container">

          <section className="cc-empty">


            <div className="cc-empty-icon">

              <IconShoppingBag
                size={42}
              />

            </div>


            <h2>
              Tidak ada produk valid
              untuk di-checkout
            </h2>


            <p>
              Produk di keranjang tidak
              memiliki data database yang
              valid. Tambahkan produk lagi
              dari katalog terbaru.
            </p>


            <Link
              to="/katalog"
              className="cc-primary-button"
            >
              Buka Katalog
            </Link>


          </section>

        </main>

      </div>
    );
  }


  // =========================================
  // CHECKOUT PAGE
  // =========================================

  return (
    <div className="cc-page">

      <Navbar />


      <main className="cc-container">


        {/* ===================================
            HEADER
        =================================== */}

        <div className="cc-page-header">

          <div>

            <span className="cc-eyebrow">
              Langkah terakhir
            </span>

            <h1>
              Checkout
            </h1>

            <p>
              Periksa informasi
              pengiriman sebelum
              membuat pesanan.
            </p>

          </div>


          <Link
            to="/cart"
            className="cc-back-link"
          >
            <IconArrowLeft
              size={16}
            />

            Kembali ke Keranjang
          </Link>

        </div>


        <form
          className="cc-layout"
          onSubmit={
            handlePlaceOrder
          }
        >


          {/* =================================
              LEFT
          ================================= */}

          <div className="cc-checkout-main">


            {/* ===============================
                SHIPPING
            =============================== */}

            <section className="cc-card cc-form-card">


              <div className="cc-card-title-icon">

                <span>
                  <IconMapPin
                    size={21}
                  />
                </span>

                <div>

                  <h2>
                    Informasi Pengiriman
                  </h2>

                  <p>
                    Data utama otomatis
                    diambil dari profilmu.
                  </p>

                </div>

              </div>


              {/* PROFILE LOADING */}

              {profileLoading && (
                <div className="cc-info-box">

                  <IconLoader2
                    size={18}
                    className="cc-spin"
                  />

                  <p>
                    Mengambil data profil...
                  </p>

                </div>
              )}


              {/* NAME */}

              <div className="cc-form-group">

                <label>

                  <IconUser
                    size={15}
                  />

                  Nama Penerima

                </label>


                <input
                  type="text"
                  value={
                    profileName ||
                    user?.name ||
                    ''
                  }
                  disabled
                  placeholder="Nama pengguna"
                />

              </div>


              {/* PHONE */}

              <div className="cc-form-group">

                <label>

                  <IconPhone
                    size={15}
                  />

                  Nomor Telepon

                  <small>
                    Dari Profil
                  </small>

                </label>


                <input
                  type="tel"
                  value={phone}
                  disabled={
                    profileLoading
                  }
                  placeholder="Belum ada nomor telepon"
                  onChange={(
                    event
                  ) =>
                    setPhone(
                      event.target.value
                    )
                  }
                />

              </div>


              {/* ADDRESS */}

              <div className="cc-form-group">

                <label>
                  Alamat Lengkap
                  <b>*</b>
                </label>


                <textarea
                  rows={4}
                  value={address}
                  disabled={
                    loading ||
                    profileLoading
                  }
                  placeholder="Contoh: Jl. Sudirman No. 12, RT 01/RW 02..."
                  onChange={(
                    event
                  ) => {

                    setAddress(
                      event.target.value
                    );

                    if (error) {
                      setError('');
                    }
                  }}
                />

              </div>


              {/* PROFILE INFO */}

              {profileLoaded &&
                (!phone ||
                  !address.trim()) && (

                <div className="cc-info-box">

                  <IconUser
                    size={18}
                  />

                  <p>
                    Data profilmu belum
                    lengkap. Kamu bisa{' '}

                    <Link
                      to="/profile"
                    >
                      melengkapi profil
                    </Link>

                    {' '}terlebih dahulu.
                  </p>

                </div>

              )}


              {/* NOTE */}

              <div className="cc-form-group">

                <label>

                  <IconNotes
                    size={15}
                  />

                  Catatan Kurir

                  <small>
                    Opsional
                  </small>

                </label>


                <input
                  type="text"
                  value={note}
                  disabled={loading}
                  placeholder="Contoh: Titipkan di pos satpam"
                  onChange={(
                    event
                  ) =>
                    setNote(
                      event.target.value
                    )
                  }
                />

              </div>


            </section>


            {/* ===============================
                PRODUCTS
            =============================== */}

            <section className="cc-card cc-checkout-products">


              <div className="cc-card-title-icon">

                <span>
                  <IconShoppingBag
                    size={21}
                  />
                </span>

                <div>

                  <h2>
                    Produk Dipesan
                  </h2>

                  <p>
                    {items.length}{' '}
                    jenis produk.
                  </p>

                </div>

              </div>


              <div className="cc-checkout-product-list">


                {items.map(
                  (
                    item,
                    index
                  ) => {

                    const price =
                      Number(
                        item.price ||
                          0
                      );

                    const quantity =
                      getQuantity(
                        item
                      );


                    return (
                      <div
                        key={`checkout-${
                          getProductId(
                            item
                          )
                        }-${index}`}
                        className="cc-checkout-product"
                      >


                        <img
                          src={
                            item.image ||
                            item.image_url ||
                            FALLBACK_IMG
                          }
                          alt={
                            item.name
                          }
                          onError={(
                            event
                          ) => {

                            event.currentTarget.onerror =
                              null;

                            event.currentTarget.src =
                              FALLBACK_IMG;
                          }}
                        />


                        <div>

                          <strong>
                            {item.name}
                          </strong>

                          <span>

                            {quantity}{' '}
                            × Rp{' '}

                            {price.toLocaleString(
                              'id-ID'
                            )}

                          </span>

                        </div>


                        <b>

                          Rp{' '}

                          {(
                            price *
                            quantity
                          ).toLocaleString(
                            'id-ID'
                          )}

                        </b>


                      </div>
                    );
                  }
                )}


              </div>


            </section>


          </div>


          {/* =================================
              RIGHT
          ================================= */}

          <aside className="cc-sidebar">


            <section className="cc-card cc-summary">


              <h2>
                Ringkasan Pesanan
              </h2>


              <div className="cc-summary-list">


                <div>

                  <span>
                    Subtotal Produk
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
                      shippingFee === 0
                        ? 'cc-free'
                        : ''
                    }
                  >

                    {shippingFee === 0
                      ? 'Gratis'
                      : `Rp ${shippingFee.toLocaleString(
                          'id-ID'
                        )}`}

                  </strong>

                </div>


              </div>


              <div className="cc-divider" />


              <div className="cc-total">

                <div>

                  <span>
                    Total Pembayaran
                  </span>

                  <small>
                    Diverifikasi backend
                  </small>

                </div>


                <strong>

                  Rp{' '}

                  {estimatedTotal.toLocaleString(
                    'id-ID'
                  )}

                </strong>

              </div>


              {/* ERROR */}

              {error && (
                <div className="cc-error">
                  {error}
                </div>
              )}


              {/* SUBMIT */}

              <button
                type="submit"
                className="cc-primary-button cc-full-button"
                disabled={
                  loading ||
                  profileLoading
                }
              >

                {loading ? (
                  <>

                    <IconLoader2
                      size={17}
                      className="cc-spin"
                    />

                    Memproses...

                  </>
                ) : (
                  <>

                    Buat Pesanan

                    <IconCircleCheck
                      size={17}
                    />

                  </>
                )}

              </button>


              <div className="cc-info-box">

                <IconLock
                  size={18}
                />

                <p>
                  Harga dan stok akan
                  diverifikasi kembali
                  oleh server.
                </p>

              </div>


              <div className="cc-info-box">

                <IconTruck
                  size={18}
                />

                <p>
                  Setelah order dibuat,
                  pembayaran dilakukan
                  melalui Pesanan Saya.
                </p>

              </div>


            </section>


          </aside>


        </form>


      </main>

    </div>
  );
}