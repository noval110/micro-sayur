import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  useLocation,
  useNavigate
} from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';

import {
  IconChevronDown,
  IconLoader2,
  IconPackage,
  IconPlus,
  IconSearch,
  IconStar
} from '@tabler/icons-react';

import './Katalog.css';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';

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

export default function Katalog() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState('Semua');

  const [sortBy, setSortBy] =
    useState('default');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const { addToCart } = useCart();

  const location = useLocation();
  const navigate = useNavigate();
useEffect(() => {
    const params =
      new URLSearchParams(location.search);

    const categoryParam =
      params.get('category');

    const searchParam =
      params.get('search');

    setSelectedCategory(
      categoryParam || 'Semua'
    );

    setSearchTerm(
      searchParam || ''
    );
  }, [location.search]);
useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await api.get('/products');

      const backendData =
        Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

      setProducts(
        Array.isArray(backendData)
          ? backendData
          : []
      );
    } catch (err) {
      console.error(
        'Gagal mengambil produk:',
        err.response?.data || err
      );

      setProducts([]);

      setError(
        'Produk belum dapat dimuat. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };
const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map((product) =>
            String(
              product.category || ''
            ).trim()
          )
          .filter(Boolean)
      )
    ];

    return [
      'Semua',
      ...uniqueCategories
    ];
  }, [products]);
const filteredProducts = useMemo(() => {
    const keyword =
      searchTerm.trim().toLowerCase();

    let result = products.filter(
      (product) => {
        const name = String(
          product.name || ''
        ).toLowerCase();

        const category = String(
          product.category || ''
        );

        const matchSearch =
          name.includes(keyword);

        const matchCategory =
          selectedCategory === 'Semua' ||
          category === selectedCategory;

        return (
          matchSearch &&
          matchCategory
        );
      }
    );

    if (sortBy === 'price-low') {
      result = [...result].sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sortBy === 'price-high') {
      result = [...result].sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sortBy === 'name') {
      result = [...result].sort(
        (a, b) =>
          String(a.name || '').localeCompare(
            String(b.name || ''),
            'id'
          )
      );
    }

    if (sortBy === 'stock') {
      result = [...result].sort(
        (a, b) =>
          Number(b.stock || 0) -
          Number(a.stock || 0)
      );
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    sortBy
  ]);
const handleCategoryChange = (
    category
  ) => {
    setSelectedCategory(category);

    const params =
      new URLSearchParams();

    if (
      category &&
      category !== 'Semua'
    ) {
      params.set(
        'category',
        category
      );
    }

    if (searchTerm.trim()) {
      params.set(
        'search',
        searchTerm.trim()
      );
    }

    const query =
      params.toString();

    navigate(
      query
        ? `/katalog?${query}`
        : '/katalog'
    );
  };
const handleSearchChange = (e) => {
    const value =
      e.target.value;

    setSearchTerm(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const params =
      new URLSearchParams();

    if (
      selectedCategory !== 'Semua'
    ) {
      params.set(
        'category',
        selectedCategory
      );
    }

    if (searchTerm.trim()) {
      params.set(
        'search',
        searchTerm.trim()
      );
    }

    const query =
      params.toString();

    navigate(
      query
        ? `/katalog?${query}`
        : '/katalog'
    );
  };
const handleAddToCart = (
    product
  ) => {
    const stock =
      Number(product.stock || 0);

    if (stock <= 0) {
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price:
        Number(product.price || 0),

      image: getProductImage(
        product.image ||
          product.image_url
      ),

      unit:
        product.unit ||
        'kg',

      stock
    });
  };

  return (
    <div className="katalog-page">
      <main className="katalog-container">
<section className="katalog-top">
          <div className="katalog-heading">
            <span className="katalog-eyebrow">
              Produk Sayur-day
            </span>

            <h1>
              Katalog Produk
            </h1>

            <p>
              Temukan kebutuhan segar
              untuk belanja harianmu.
            </p>
          </div>

          <form
            className="katalog-search"
            onSubmit={
              handleSearchSubmit
            }
          >
            <IconSearch
              size={18}
            />

            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={
                handleSearchChange
              }
            />

            <button type="submit">
              Cari
            </button>
          </form>
        </section>
<section className="katalog-toolbar">
          <div className="katalog-category-list">
            {categories.map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    selectedCategory ===
                    category
                      ? 'katalog-category-btn active'
                      : 'katalog-category-btn'
                  }
                  onClick={() =>
                    handleCategoryChange(
                      category
                    )
                  }
                >
                  {category}
                </button>
              )
            )}
          </div>

          <div className="katalog-sort-wrap">
            <span>
              Urutkan
            </span>

            <div className="katalog-select-wrap">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
              >
                <option value="default">
                  Default
                </option>

                <option value="price-low">
                  Harga Terendah
                </option>

                <option value="price-high">
                  Harga Tertinggi
                </option>

                <option value="name">
                  Nama A-Z
                </option>

                <option value="stock">
                  Stok Terbanyak
                </option>
              </select>

              <IconChevronDown
                size={15}
              />
            </div>
          </div>
        </section>
{!loading &&
          !error && (
            <div className="katalog-result-info">
              <strong>
                {
                  filteredProducts.length
                }
              </strong>

              <span>
                produk ditemukan
              </span>

              {searchTerm && (
                <span>
                  untuk "{searchTerm}"
                </span>
              )}
            </div>
          )}
{loading ? (
          <div className="katalog-state">
            <IconLoader2
              size={30}
              className="katalog-spin"
            />

            <span>
              Memuat produk...
            </span>
          </div>
        ) : error ? (
          <div className="katalog-error">
            <IconPackage
              size={30}
            />

            <div>
              <strong>
                Produk tidak dapat dimuat
              </strong>

              <p>
                {error}
              </p>

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
        ) : filteredProducts.length ===
          0 ? (
          <div className="katalog-state">
            <IconSearch
              size={30}
            />

            <strong>
              Produk tidak ditemukan
            </strong>

            <span>
              Coba gunakan kata
              pencarian atau kategori
              lain.
            </span>
          </div>
        ) : (
          <div className="katalog-grid">
            {filteredProducts.map(
              (product, index) => {
                const stock =
                  Number(
                    product.stock || 0
                  );

                const soldOut =
                  stock <= 0;

                return (
                  <article
                    key={`katalog-${product.id}-${index}`}
                    className="katalog-card"
                  >
                    <div className="katalog-card-image">
                      <img
                        src={getProductImage(
                          product.image ||
                            product.image_url
                        )}
                        alt={
                          product.name
                        }
                        onError={(e) => {
                          e.currentTarget.onerror =
                            null;

                          e.currentTarget.src =
                            FALLBACK_IMG;
                        }}
                      />

                      <span className="katalog-card-category">
                        {product.category ||
                          'Produk'}
                      </span>

                      {soldOut && (
                        <span className="katalog-card-soldout">
                          Stok Habis
                        </span>
                      )}
                    </div>

                    <div className="katalog-card-body">
                      <span className="katalog-card-subcategory">
                        {product.category ||
                          'Produk Segar'}
                      </span>

                      <h3>
                        {product.name}
                      </h3>

                      <div className="katalog-rating">
                        <IconStar
                          size={14}
                          color="#f59e0b"
                          fill="#f59e0b"
                        />

                        <strong>
                          {product.rating ||
                            '4.8'}
                        </strong>

                        <span>
                          Stok {stock}
                        </span>
                      </div>

                      <div className="katalog-card-footer">
                        <div className="katalog-price">
                          <strong>
                            Rp{' '}
                            {Number(
                              product.price || 0
                            ).toLocaleString(
                              'id-ID'
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
                          className={
                            soldOut
                              ? 'katalog-add-btn disabled'
                              : 'katalog-add-btn'
                          }
                          disabled={
                            soldOut
                          }
                          onClick={() =>
                            handleAddToCart(
                              product
                            )
                          }
                        >
                          <IconPlus
                            size={16}
                          />

                          {soldOut
                            ? 'Habis'
                            : 'Tambah'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </main>
    </div>
  );
}
