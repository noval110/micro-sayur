import React, { useState } from 'react';
import {
  Link,
  useNavigate
} from 'react-router-dom';

import {
  IconAlertCircle,
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconLeaf,
  IconLoader2,
  IconLock,
  IconMail,
  IconShieldCheck
} from '@tabler/icons-react';

import {
  useAuth
} from '../../context/AuthContext';

import './Auth.css';


export default function Login() {
  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [
    showPassword,
    setShowPassword
  ] = useState(false);

  const [errorMsg, setErrorMsg] =
    useState('');

  const {
    login,
    loading
  } = useAuth();

  const navigate =
    useNavigate();


  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setErrorMsg('');

    const cleanEmail =
      email.trim();

    if (!cleanEmail) {
      setErrorMsg(
        'Email wajib diisi.'
      );

      return;
    }

    if (!password) {
      setErrorMsg(
        'Password wajib diisi.'
      );

      return;
    }

    if (password.length < 8) {
      setErrorMsg(
        'Password minimal 8 karakter.'
      );

      return;
    }

    try {
      await login(
        cleanEmail,
        password
      );

      navigate(
        '/',
        {
          replace: true
        }
      );

    } catch (err) {
      setErrorMsg(
        err?.message ||
        'Login gagal. Periksa email dan password.'
      );
    }
  };


  return (
    <div className="auth-page">

      <div className="auth-layout">
<section className="auth-showcase">
          <Link
            to="/"
            className="auth-brand"
          >
            <span>
              <IconLeaf size={22} />
            </span>

            Sayur-day
          </Link>

          <div className="auth-showcase-content">
            <span className="auth-showcase-badge">
              Belanja lebih mudah
            </span>

            <h1>
              Produk segar untuk
              kebutuhan harianmu.
            </h1>

            <p>
              Masuk untuk melihat
              pesanan, melakukan
              pembayaran, dan
              berbelanja produk segar.
            </p>

            <div className="auth-benefits">
              <div>
                <IconShieldCheck
                  size={18}
                />

                <span>
                  Transaksi aman
                </span>
              </div>

              <div>
                <IconLeaf
                  size={18}
                />

                <span>
                  Produk segar
                </span>
              </div>
            </div>
          </div>
        </section>
<section className="auth-form-section">

          <div className="auth-card">

            <Link
              to="/"
              className="auth-back"
            >
              <IconArrowLeft
                size={16}
              />

              Kembali ke Beranda
            </Link>

            <div className="auth-title">
              <span>
                Selamat datang
              </span>

              <h2>
                Masuk ke akun
              </h2>

              <p>
                Gunakan email dan
                password akun
                Sayur-day.
              </p>
            </div>


            {errorMsg && (
              <div className="auth-alert auth-alert-error">
                <IconAlertCircle
                  size={18}
                />

                <span>
                  {errorMsg}
                </span>
              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >

              <div className="auth-field">
                <label
                  htmlFor="login-email"
                >
                  Email
                </label>

                <div className="auth-input-wrap">
                  <IconMail
                    size={18}
                  />

                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="nama@email.com"
                    value={email}
                    disabled={loading}
                    onChange={(e) => {
                      setEmail(
                        e.target.value
                      );

                      if (errorMsg) {
                        setErrorMsg('');
                      }
                    }}
                  />
                </div>
              </div>


              <div className="auth-field">
                <label
                  htmlFor="login-password"
                >
                  Password
                </label>

                <div className="auth-input-wrap">
                  <IconLock
                    size={18}
                  />

                  <input
                    id="login-password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    required
                    minLength={8}
                    autoComplete="current-password"
                    placeholder="Minimal 8 karakter"
                    value={password}
                    disabled={loading}
                    onChange={(e) => {
                      setPassword(
                        e.target.value
                      );

                      if (errorMsg) {
                        setErrorMsg('');
                      }
                    }}
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        current =>
                          !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Sembunyikan password'
                        : 'Tampilkan password'
                    }
                  >
                    {showPassword ? (
                      <IconEyeOff
                        size={17}
                      />
                    ) : (
                      <IconEye
                        size={17}
                      />
                    )}
                  </button>
                </div>

                <small>
                  Password minimal
                  8 karakter.
                </small>
              </div>


              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <IconLoader2
                      size={18}
                      className="auth-spin"
                    />

                    Memproses...
                  </>
                ) : (
                  'Masuk Akun'
                )}
              </button>

            </form>


            <p className="auth-switch">
              Belum punya akun?{' '}

              <Link to="/register">
                Daftar sekarang
              </Link>
            </p>

          </div>
        </section>

      </div>
    </div>
  );
}