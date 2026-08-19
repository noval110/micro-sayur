import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  Link,
  NavLink,
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  IconChevronDown,
  IconLayoutGrid,
  IconLeaf,
  IconLogout,
  IconMenu2,
  IconReceipt,
  IconSearch,
  IconShieldCheck,
  IconShoppingCart,
  IconUser,
  IconX
} from '@tabler/icons-react';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

import api from '../api';

import './Navbar.css';


export default function Navbar() {
  const {
    user,
    logout,
    isAuthenticated
  } = useAuth();

  const {
    cartItems
  } = useCart();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const navbarRef =
    useRef(null);

  const [
    showUserMenu,
    setShowUserMenu
  ] = useState(false);

  const [
    showCategoryMenu,
    setShowCategoryMenu
  ] = useState(false);

  const [
    showMobileMenu,
    setShowMobileMenu
  ] = useState(false);

  const [
    isScrolled,
    setIsScrolled
  ] = useState(false);

  const [
    products,
    setProducts
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm
  ] = useState('');
const totalCartCount =
    useMemo(() => {
      if (
        !Array.isArray(
          cartItems
        )
      ) {
        return 0;
      }

      return cartItems.reduce(
        (total, item) =>
          total +
          Number(
            item.quantity || 0
          ),
        0
      );
    }, [cartItems]);
useEffect(() => {
    const fetchProducts =
      async () => {
        try {
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

          setProducts(
            Array.isArray(
              backendData
            )
              ? backendData
              : []
          );
        } catch (error) {
          console.error(
            'Gagal mengambil kategori navbar:',
            error.response?.data ||
              error
          );

          setProducts([]);
        }
      };

    fetchProducts();
  }, []);
const categories =
    useMemo(() => {
      return [
        ...new Set(
          products
            .map(
              (product) =>
                String(
                  product.category ||
                    ''
                ).trim()
            )
            .filter(Boolean)
        )
      ].slice(0, 8);
    }, [products]);
useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(
        window.scrollY > 15
      );
    };

    handleScroll();

    window.addEventListener(
      'scroll',
      handleScroll
    );

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );
    };
  }, []);
useEffect(() => {
    setShowUserMenu(false);
    setShowCategoryMenu(false);
    setShowMobileMenu(false);
  }, [
    location.pathname,
    location.search
  ]);
useEffect(() => {
    const handleClickOutside =
      (event) => {
        if (
          navbarRef.current &&
          !navbarRef.current.contains(
            event.target
          )
        ) {
          setShowUserMenu(false);
          setShowCategoryMenu(false);
        }
      };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);
const handleLogout = () => {
    setShowUserMenu(false);
    setShowMobileMenu(false);

    logout();

    navigate('/login');
  };
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

    setSearchTerm('');
    setShowMobileMenu(false);
  };
const handleCategory = (
    category
  ) => {
    navigate(
      `/katalog?category=${encodeURIComponent(
        category
      )}`
    );

    setShowCategoryMenu(false);
    setShowMobileMenu(false);
  };


  return (
    <header
      ref={navbarRef}
      className={`navbar-header ${
        isScrolled
          ? 'navbar-scrolled'
          : ''
      }`}
    >
<div className="navbar-main">

        <div className="navbar-container">
<Link
            to="/"
            className="navbar-brand"
          >
            <span className="navbar-logo-icon">
              <IconLeaf size={21} />
            </span>

            <span>
              Sayur-day
            </span>
          </Link>
<form
            className="navbar-search"
            onSubmit={handleSearch}
          >
            <IconSearch
              size={18}
            />

            <input
              type="text"
              value={searchTerm}
              placeholder="Cari produk..."
              onChange={(event) =>
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
<div className="navbar-actions">
<Link
              to="/cart"
              className="navbar-cart-button"
              aria-label="Keranjang"
            >
              <IconShoppingCart
                size={21}
              />

              <span className="navbar-cart-text">
                Keranjang
              </span>

              {totalCartCount > 0 && (
                <span className="navbar-cart-count">
                  {totalCartCount > 99
                    ? '99+'
                    : totalCartCount}
                </span>
              )}
            </Link>
{isAuthenticated ? (
              <div className="navbar-user-wrapper">

                <button
                  type="button"
                  className="navbar-user-button"
                  onClick={() => {
                    setShowUserMenu(
                      (current) =>
                        !current
                    );

                    setShowCategoryMenu(
                      false
                    );
                  }}
                >

                  <span className="navbar-user-avatar">
                    <IconUser
                      size={18}
                    />
                  </span>

                  <span className="navbar-user-info">
                    <small>
                      Halo,
                    </small>

                    <strong>
                      {user?.name ||
                        'Akun'}
                    </strong>
                  </span>

                  <IconChevronDown
                    size={15}
                    className={
                      showUserMenu
                        ? 'navbar-chevron active'
                        : 'navbar-chevron'
                    }
                  />

                </button>
{showUserMenu && (
                  <div className="navbar-user-dropdown">

                    <div className="navbar-dropdown-profile">

                      <span className="navbar-dropdown-avatar">
                        <IconUser
                          size={20}
                        />
                      </span>

                      <div>
                        <strong>
                          {user?.name ||
                            'Pengguna'}
                        </strong>

                        <span>
                          {user?.role ||
                            'Customer'}
                        </span>
                      </div>

                    </div>


                    <div className="navbar-dropdown-divider" />


                    {user?.role ===
                      'Super Admin' && (
                      <Link
                        to="/admin"
                        className="navbar-dropdown-item navbar-admin-link"
                      >
                        <IconShieldCheck
                          size={17}
                        />

                        Panel Admin
                      </Link>
                    )}


                    <Link
                      to="/profile"
                      className="navbar-dropdown-item"
                    >
                      <IconUser
                        size={17}
                      />

                      Profil Saya
                    </Link>


                    <Link
                      to="/my-orders"
                      className="navbar-dropdown-item"
                    >
                      <IconReceipt
                        size={17}
                      />

                      Pesanan Saya
                    </Link>


                    <div className="navbar-dropdown-divider" />


                    <button
                      type="button"
                      className="navbar-dropdown-item navbar-logout"
                      onClick={
                        handleLogout
                      }
                    >
                      <IconLogout
                        size={17}
                      />

                      Keluar
                    </button>

                  </div>
                )}

              </div>
            ) : (
              <Link
                to="/login"
                className="navbar-login-button"
              >
                <IconUser
                  size={17}
                />

                Masuk
              </Link>
            )}
<button
              type="button"
              className="navbar-mobile-toggle"
              onClick={() =>
                setShowMobileMenu(
                  (current) =>
                    !current
                )
              }
              aria-label="Menu"
            >
              {showMobileMenu ? (
                <IconX size={23} />
              ) : (
                <IconMenu2 size={23} />
              )}
            </button>

          </div>

        </div>

      </div>
<div className="navbar-bottom">

        <div className="navbar-container navbar-bottom-inner">
<div className="navbar-category-wrapper">

            <button
              type="button"
              className="navbar-category-button"
              onClick={() => {
                setShowCategoryMenu(
                  (current) =>
                    !current
                );

                setShowUserMenu(false);
              }}
            >
              <IconLayoutGrid
                size={17}
              />

              Semua Kategori

              <IconChevronDown
                size={14}
                className={
                  showCategoryMenu
                    ? 'navbar-chevron active'
                    : 'navbar-chevron'
                }
              />
            </button>


            {showCategoryMenu && (
              <div className="navbar-category-dropdown">

                <div className="navbar-category-header">
                  <span>
                    Kategori Produk
                  </span>

                  <small>
                    Berdasarkan katalog
                    terbaru
                  </small>
                </div>


                {categories.length > 0 ? (
                  <div className="navbar-category-grid">

                    {categories.map(
                      (category) => (
                        <button
                          type="button"
                          key={category}
                          onClick={() =>
                            handleCategory(
                              category
                            )
                          }
                        >
                          <span className="navbar-category-dot" />

                          {category}
                        </button>
                      )
                    )}

                  </div>
                ) : (
                  <div className="navbar-category-empty">
                    Belum ada kategori
                  </div>
                )}


                <Link
                  to="/katalog"
                  className="navbar-all-products"
                >
                  Lihat Semua Produk
                </Link>

              </div>
            )}

          </div>
<nav className="navbar-navigation">

            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? 'navbar-nav-link active'
                  : 'navbar-nav-link'
              }
            >
              Beranda
            </NavLink>


            <NavLink
              to="/katalog"
              className={({ isActive }) =>
                isActive
                  ? 'navbar-nav-link active'
                  : 'navbar-nav-link'
              }
            >
              Katalog
            </NavLink>


            {isAuthenticated && (
              <NavLink
                to="/my-orders"
                className={({ isActive }) =>
                  isActive
                    ? 'navbar-nav-link active'
                    : 'navbar-nav-link'
                }
              >
                Pesanan Saya
              </NavLink>
            )}


            {user?.role ===
              'Super Admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive
                    ? 'navbar-nav-link navbar-nav-admin active'
                    : 'navbar-nav-link navbar-nav-admin'
                }
              >
                Admin
              </NavLink>
            )}

          </nav>

        </div>

      </div>
{showMobileMenu && (
        <div className="navbar-mobile-menu">

          <form
            className="navbar-mobile-search"
            onSubmit={handleSearch}
          >
            <IconSearch
              size={18}
            />

            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(event) =>
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


          <nav className="navbar-mobile-links">

            <NavLink
              to="/"
              end
            >
              Beranda
            </NavLink>


            <NavLink
              to="/katalog"
            >
              Katalog
            </NavLink>


            {isAuthenticated && (
              <NavLink
                to="/profile"
              >
                Profil Saya
              </NavLink>
            )}


            {isAuthenticated && (
              <NavLink
                to="/my-orders"
              >
                Pesanan Saya
              </NavLink>
            )}


            {user?.role ===
              'Super Admin' && (
              <NavLink
                to="/admin"
              >
                Panel Admin
              </NavLink>
            )}

          </nav>


          {categories.length > 0 && (
            <div className="navbar-mobile-categories">

              <strong>
                Kategori
              </strong>

              <div>
                {categories.map(
                  (category) => (
                    <button
                      type="button"
                      key={category}
                      onClick={() =>
                        handleCategory(
                          category
                        )
                      }
                    >
                      {category}
                    </button>
                  )
                )}
              </div>

            </div>
          )}

        </div>
      )}

    </header>
  );
}
