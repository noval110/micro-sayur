import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Link,
  useNavigate
} from 'react-router-dom';

import api from '../api';

import {
  useCart
} from '../context/CartContext';

import {
  IconAlertCircle,
  IconArrowRight,
  IconCheck,
  IconDiscount2,
  IconHeadset,
  IconLeaf,
  IconLoader2,
  IconSearch,
  IconShieldCheck,
  IconShoppingCart,
  IconStar,
  IconTruck
} from '@tabler/icons-react';

import './Home.css';


const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';


const HERO_IMAGE =
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900&auto=format&fit=crop&q=85';


const CATEGORY_FALLBACKS = [
  {
    name: 'Buah Segar',
    category: 'Buah',
    image:
      'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Sayur Daun',
    category: 'Sayur Daun',
    image:
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Sayuran',
    category: 'Sayur',
    image:
      'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Umbi',
    category: 'Umbi',
    image:
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bumbu Dapur',
    category: 'Bumbu',
    image:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Buah Sayur',
    category: 'Buah Sayur',
    image:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80'
  }
];


const formatRupiah = (
  value
) => {
  return new Intl.NumberFormat(
    'id-ID'
  ).format(
    Number(value || 0)
  );
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://quirky_woz-48b.n.jrnm.app';

const getProductImage = (image) => {
  if (!image) return FALLBACK_IMG;

  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:')
  ) {
    return image;
  }

  const cleanImage = image.replace(/^\/+/, '');

  if (cleanImage.startsWith('uploads/')) {
    return `${API_BASE}/${cleanImage}`;
  }

  return `${API_BASE}/uploads/${cleanImage}`;
};


export default function Home() {
  const navigate =
    useNavigate();

  const {
    addToCart
  } = useCart();

  const [
    products,
    setProducts
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm
  ] = useState('');

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState('');

  const [
    toast,
    setToast
  ] = useState(null);

  // TYPING EFFECT SEARCH PLACEHOLDER

  const searchPhrases = useMemo(() => [
    "Cari pisang, wortel, alpukat...",
    "Cari sayuran hijau segar...",
    "Cari bumbu dapur lengkap...",
    "Belanja kebutuhan dapur..."
  ], []);

  const [placeholderText, setPlaceholderText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    const currentPhrase = searchPhrases[phraseIndex];
    let typingSpeed = 100;

    if (isDeleting) {
      typingSpeed = 50;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && placeholderText === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && placeholderText === "") {
        setIsDeleting(false);
        setPhraseIndex((prevIndex) => (prevIndex + 1) % searchPhrases.length);
      } else {
        const nextText = isDeleting
          ? currentPhrase.substring(0, placeholderText.length - 1)
          : currentPhrase.substring(0, placeholderText.length + 1);
        setPlaceholderText(nextText);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, phraseIndex, searchPhrases]);


  // FETCH PRODUCTS

  const fetchProducts =
    async () => {
      try {
        setLoading(true);
        setError('');

        const response =
          await api.get(
            '/products'
          );

        const backendData =
          Array.isArray(
            response.data
          )
            ? response.data
            : response.data?.data ||
              [];

        const cleanProducts =
          backendData
            .filter((product) => product)
            .map((product, index) => ({
              ...product,

              id:
                product.id ||
                product.product_id ||
                `product-${index}`,

              name:
                product.name ||
                product.product_name ||
                'Produk',

              price:
                Number(product.price || 0),

              stock:
                Number(product.stock ?? 0),

              category:
                product.category ||
                'Lainnya',

              unit:
                product.unit ||
                'kg',

              image: getProductImage(
                product.image ||
                  product.image_url
              ),

              rating:
                Number(product.rating || 4.8)
            }));

        setProducts(cleanProducts);
      } catch (err) {
        console.error(
          'Gagal mengambil produk:',
          err.response?.data ||
            err
        );

        setProducts([]);

        setError(
          'Produk gagal dimuat dari server.'
        );
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    fetchProducts();
  }, []);


  // CATEGORIES

  const categories =
    useMemo(() => {
      return CATEGORY_FALLBACKS.map(
        (category) => {
          const count =
            products.filter(
              (product) =>
                String(
                  product.category ||
                    ''
                )
                  .toLowerCase()
                  .includes(
                    category.category.toLowerCase()
                  )
            ).length;

          return {
            ...category,
            count
          };
        }
      );
    }, [products]);


  // POPULAR PRODUCTS

  const popularProducts =
    useMemo(() => {
      return [...products]
        .sort(
          (a, b) =>
            Number(
              b.rating || 0
            ) -
            Number(
              a.rating || 0
            )
        )
        .slice(0, 8);
    }, [products]);


  // SEARCH

  const handleSearch = (
    event
  ) => {
    event.preventDefault();

    const keyword =
      searchTerm.trim();

    if (!keyword) {
      navigate('/katalog');
      return;
    }

    navigate(
      `/katalog?search=${encodeURIComponent(
        keyword
      )}`
    );
  };


  // CATEGORY

  const handleCategory = (
    category
  ) => {
    navigate(
      `/katalog?category=${encodeURIComponent(
        category
      )}`
    );
  };


  // CART

  const handleAddToCart = (
    product
  ) => {
    if (
      Number(product.stock) <= 0
    ) {
      showToast(
        'Produk sedang habis.',
        'error'
      );

      return;
    }

    addToCart({
      id:
        product.id,

      name:
        product.name,

      price:
        Number(
          product.price
        ),

      image: getProductImage(
        product.image ||
          product.image_url
      ),

      unit:
        product.unit ||
        'kg',

      stock:
        Number(
          product.stock ||
            0
        )
    });

  };


  // TOAST

  const showToast = (
    message,
    type = 'success'
  ) => {
    setToast({
      message,
      type
    });

    window.setTimeout(
      () => {
        setToast(null);
      },
      2500
    );
  };


  return (
    <div className="home-page">

      {/* TOAST */}

      {toast && (
        <div
          style={{
            position:
              'fixed',

            right:
              '24px',

            bottom:
              '24px',

            zIndex:
              9999,

            display:
              'flex',

            alignItems:
              'center',

            gap:
              '8px',

            padding:
              '13px 16px',

            borderRadius:
              '10px',

            background:
              toast.type ===
              'error'
                ? '#b42323'
                : '#21313c',

            color:
              '#ffffff',

            fontSize:
              '0.78rem',

            fontWeight:
              600,

            boxShadow:
              '0 14px 35px rgba(33,49,60,.18)'
          }}
        >
          {toast.type ===
          'error' ? (
            <IconAlertCircle
              size={17}
            />
          ) : (
            <IconCheck
              size={17}
            />
          )}

          {toast.message}
        </div>
      )}


      {/* HERO */}

      <section className="home-hero-section">

        <div className="home-hero">

          <div className="home-hero-content">

            <span className="home-hero-badge">
              Segar setiap hari
            </span>


            <h1>
              Sayur & Buah Segar
              <br />

              <span>
                Langsung Dari Petani
              </span>
            </h1>


            <p>
              Belanja kebutuhan dapur
              lebih mudah dengan pilihan
              sayur dan buah segar yang
              dikirim langsung untukmu.
            </p>


            <div className="home-hero-actions">

              <Link
                to="/katalog"
                className="home-primary-btn"
              >
                Belanja Sekarang

                <IconArrowRight
                  size={17}
                />
              </Link>


              <div className="home-free-shipping">
                <IconTruck
                  size={18}
                />

                Gratis ongkir transaksi
                di atas Rp100.000
              </div>

            </div>


            <form
              className="home-search-box"
              onSubmit={
                handleSearch
              }
            >
              <IconSearch
                size={19}
                className="home-search-icon"
              />

              <input
                type="text"
                placeholder={placeholderText + (showCursor ? '|' : '')}
                value={
                  searchTerm
                }
                onChange={(
                  event
                ) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />

              <button
                type="submit"
              >
                Cari
              </button>
            </form>

          </div>


          {/* HERO IMAGE */}

          <div className="home-hero-visual">

            <div className="home-hero-image-wrap">

              <img
                src={HERO_IMAGE}
                alt="Buah dan sayur segar"
              />


              <div className="home-floating-card home-floating-card-top">

                <span className="home-floating-icon">
                  <IconLeaf
                    size={19}
                  />
                </span>

                <div>
                  <strong>
                    Fresh Setiap Hari
                  </strong>

                  <small>
                    Langsung dari petani
                  </small>
                </div>

              </div>


              <div className="home-floating-card home-floating-card-bottom">

                <span className="home-floating-icon">
                  <IconShieldCheck
                    size={19}
                  />
                </span>

                <div>
                  <strong>
                    Jaminan Segar
                  </strong>

                  <small>
                    Kualitas terjamin
                  </small>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* CATEGORIES */}

      <section className="home-section">

        <div className="home-section-header">

          <div>

            <span className="home-eyebrow">
              Kategori
            </span>

            <h2>
              Kategori Pilihan
            </h2>

            <p>
              Temukan kebutuhan segar
              sesuai kategori favoritmu.
            </p>

          </div>


          <Link
            to="/katalog"
            className="home-text-link"
          >
            Lihat Semua

            <IconArrowRight
              size={15}
            />
          </Link>

        </div>


        <div className="home-categories-grid">

          {categories.map(
            (category) => (
              <button
                type="button"
                key={
                  category.name
                }
                className="home-category-card"
                onClick={() =>
                  handleCategory(
                    category.category
                  )
                }
              >

                <div className="home-category-image">
                  <img
                    src={
                      category.image
                    }
                    alt={
                      category.name
                    }
                  />
                </div>

                <strong>
                  {category.name}
                </strong>

                <span>
                  {category.count > 0
                    ? `${category.count} produk`
                    : 'Lihat produk'}
                </span>

              </button>
            )
          )}

        </div>

      </section>


      {/* PROMO */}

      <section className="home-section">

        <div className="home-promo-grid">

          <article className="home-promo-card home-promo-green">

            <div>
              <span>
                Pilihan Segar
              </span>

              <h3>
                Buah Segar
                Untuk Harimu
              </h3>

              <p>
                Pilihan buah berkualitas
                dengan harga terbaik
                untuk kebutuhan keluarga.
              </p>

              <Link
                to="/katalog?category=Buah"
              >
                Belanja Sekarang

                <IconArrowRight
                  size={14}
                />
              </Link>
            </div>

            <img
              src="https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=700&auto=format&fit=crop&q=80"
              alt="Buah segar"
            />

          </article>


          <article className="home-promo-card home-promo-yellow">

            <div>
              <span>
                Dari Petani
              </span>

              <h3>
                Sayuran Segar
                Setiap Hari
              </h3>

              <p>
                Lengkapi kebutuhan dapur
                dengan sayuran segar
                pilihan setiap hari.
              </p>

              <Link
                to="/katalog?category=Sayur"
              >
                Lihat Sayuran

                <IconArrowRight
                  size={14}
                />
              </Link>
            </div>

            <img
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80"
              alt="Sayuran segar"
            />

          </article>

        </div>

      </section>


      {/* PRODUCTS */}

      <section className="home-section">

        <div className="home-section-header">

          <div>

            <span className="home-eyebrow">
              Pilihan Terbaik
            </span>

            <h2>
              Produk Populer
            </h2>

            <p>
              Produk favorit dengan stok
              yang selalu diperbarui.
            </p>

          </div>


          <Link
            to="/katalog"
            className="home-text-link"
          >
            Lihat Semua

            <IconArrowRight
              size={15}
            />
          </Link>

        </div>


        {/* ERROR */}

        {error && (
          <div className="home-error-box">

            <IconAlertCircle
              size={25}
            />

            <div>
              <strong>
                Tidak dapat terhubung
                ke server
              </strong>

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={
                  fetchProducts
                }
              >
                Coba Lagi
              </button>
            </div>

          </div>
        )}


        {/* LOADING */}

        {loading ? (
          <div className="home-loading">

            <IconLoader2
              size={28}
              className="home-spin"
            />

            Memuat produk...

          </div>
        ) : popularProducts.length ===
          0 ? (
          <div className="home-empty-box">

            <IconShoppingCart
              size={28}
            />

            Belum ada produk.

          </div>
        ) : (
          <div className="home-products-grid">

            {popularProducts.map(
              (product) => (
                <article
                  key={
                    product.id
                  }
                  className="home-product-card"
                >

                  {/* IMAGE */}

                  <div className="home-product-image-wrap">

                    <img
                      src={
                        product.image ||
                        FALLBACK_IMG
                      }
                      alt={
                        product.name
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


                    <span className="home-product-category">
                      {product.category ||
                        'Sayur'}
                    </span>


                    {Number(
                      product.stock
                    ) <= 0 && (
                      <span className="home-stock-empty">
                        Habis
                      </span>
                    )}

                  </div>


                  {/* BODY */}

                  <div className="home-product-body">

                    <span className="home-product-small-category">
                      {product.category ||
                        'Sayur'}
                    </span>


                    <h3>
                      {product.name}
                    </h3>


                    <div className="home-product-rating">

                      <IconStar
                        size={14}
                        fill="#ffc107"
                        color="#ffc107"
                      />

                      <strong>
                        {Number(
                          product.rating ||
                            4.8
                        ).toFixed(
                          1
                        )}
                      </strong>

                      <span>
                        • Stok{' '}
                        {product.stock}
                      </span>

                    </div>


                    <div className="home-product-footer">

                      <div className="home-product-price">

                        <strong>
                          Rp{' '}
                          {formatRupiah(
                            product.price
                          )}
                        </strong>

                        <span>
                          /
                          {product.unit ||
                            'kg'}
                        </span>

                      </div>


                      <button
                        type="button"
                        className={`home-add-cart-btn ${
                          Number(
                            product.stock
                          ) <= 0
                            ? 'disabled'
                            : ''
                        }`}
                        disabled={
                          Number(
                            product.stock
                          ) <= 0
                        }
                        onClick={() =>
                          handleAddToCart(
                            product
                          )
                        }
                      >
                        <IconShoppingCart
                          size={14}
                        />

                        + Beli
                      </button>

                    </div>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </section>


      {/* BENEFITS */}

      <section className="home-benefits">

        <div className="home-benefits-container">


          <div className="home-benefit-card">

            <IconTruck
              size={31}
              className="home-benefit-icon"
            />

            <div>
              <h3>
                Pengiriman Kilat
              </h3>

              <p>
                Pesanan diproses cepat
                untuk sampai dalam
                kondisi segar.
              </p>
            </div>

          </div>


          <div className="home-benefit-card">

            <IconShieldCheck
              size={31}
              className="home-benefit-icon"
            />

            <div>
              <h3>
                Jaminan Segar 100%
              </h3>

              <p>
                Kualitas produk selalu
                kami jaga sampai ke
                tanganmu.
              </p>
            </div>

          </div>


          <div className="home-benefit-card">

            <IconDiscount2
              size={31}
              className="home-benefit-icon"
            />

            <div>
              <h3>
                Harga Terbaik
              </h3>

              <p>
                Harga bersahabat untuk
                kebutuhan segar
                sehari-hari.
              </p>
            </div>

          </div>


          <div className="home-benefit-card">

            <IconHeadset
              size={31}
              className="home-benefit-icon"
            />

            <div>
              <h3>
                Dukungan Pelanggan
              </h3>

              <p>
                Kami siap membantu saat
                kamu mengalami kendala
                belanja.
              </p>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
