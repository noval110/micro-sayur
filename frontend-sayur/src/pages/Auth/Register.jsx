import React, {
  useState
} from 'react';

import {
  Link,
  useNavigate
} from 'react-router-dom';

import api from '../../api';

import {
  IconAlertCircle,
  IconArrowLeft,
  IconCircleCheck,
  IconEye,
  IconEyeOff,
  IconLeaf,
  IconLoader2,
  IconLock,
  IconMail,
  IconShieldCheck,
  IconUser
} from '@tabler/icons-react';

import './Auth.css';


export default function Register() {
  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [
    passwordConfirmation,
    setPasswordConfirmation
  ] = useState('');

  const [
    showPassword,
    setShowPassword
  ] = useState(false);

  const [
    showConfirmation,
    setShowConfirmation
  ] = useState(false);

  const [errorMsg, setErrorMsg] =
    useState('');

  const [
    successMsg,
    setSuccessMsg
  ] = useState('');

  const [loading, setLoading] =
    useState(false);

  const navigate =
    useNavigate();


  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');

    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim();

    if (!cleanName) {
      setErrorMsg(
        'Nama lengkap wajib diisi.'
      );

      return;
    }

    if (!cleanEmail) {
      setErrorMsg(
        'Email wajib diisi.'
      );

      return;
    }

    if (password.length < 8) {
      setErrorMsg(
        'Password minimal 8 karakter.'
      );

      return;
    }

    if (
      password !==
      passwordConfirmation
    ) {
      setErrorMsg(
        'Konfirmasi password tidak cocok.'
      );

      return;
    }

    try {
      setLoading(true);

      await api.post(
        '/users/signup',
        {
          name: cleanName,
          email: cleanEmail,
          password,
          password_confirmation:
            passwordConfirmation
        }
      );

      setSuccessMsg(
        'Pendaftaran berhasil. Kamu akan diarahkan ke halaman login.'
      );

      window.setTimeout(
        () => {
          navigate('/login');
        },
        1400
      );

    } catch (err) {
      const message =
        err.response?.data
          ?.massage ||
        err.response?.data
          ?.message ||
        'Pendaftaran gagal.';

      setErrorMsg(
        message
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">

      <div className="auth-layout">

        {/* LEFT */}

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
              Mulai berbelanja
            </span>

            <h1>
              Buat akun dan nikmati
              belanja produk segar.
            </h1>

            <p>
              Daftar sekali untuk
              menyimpan pesanan,
              pembayaran, dan riwayat
              transaksi Sayur-day.
            </p>

            <div className="auth-benefits">
              <div>
                <IconShieldCheck
                  size={18}
                />

                <span>
                  Akun terlindungi
                </span>
              </div>

              <div>
                <IconLeaf
                  size={18}
                />

                <span>
                  Belanja praktis
                </span>
              </div>
            </div>
          </div>
        </section>


        {/* RIGHT */}

        <section className="auth-form-section">

          <div className="auth-card auth-register-card">

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
                Akun baru
              </span>

              <h2>
                Daftar Sayur-day
              </h2>

              <p>
                Isi data di bawah untuk
                membuat akun.
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


            {successMsg && (
              <div className="auth-alert auth-alert-success">
                <IconCircleCheck
                  size={18}
                />

                <span>
                  {successMsg}
                </span>
              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >

              <div className="auth-field">
                <label
                  htmlFor="register-name"
                >
                  Nama Lengkap
                </label>

                <div className="auth-input-wrap">
                  <IconUser
                    size={18}
                  />

                  <input
                    id="register-name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Nama Anda"
                    value={name}
                    disabled={loading}
                    onChange={(e) => {
                      setName(
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
                  htmlFor="register-email"
                >
                  Email
                </label>

                <div className="auth-input-wrap">
                  <IconMail
                    size={18}
                  />

                  <input
                    id="register-email"
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
                  htmlFor="register-password"
                >
                  Password
                </label>

                <div className="auth-input-wrap">
                  <IconLock
                    size={18}
                  />

                  <input
                    id="register-password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
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
              </div>


              <div className="auth-field">
                <label
                  htmlFor="register-confirmation"
                >
                  Konfirmasi Password
                </label>

                <div className="auth-input-wrap">
                  <IconLock
                    size={18}
                  />

                  <input
                    id="register-confirmation"
                    type={
                      showConfirmation
                        ? 'text'
                        : 'password'
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Ulangi password"
                    value={
                      passwordConfirmation
                    }
                    disabled={loading}
                    onChange={(e) => {
                      setPasswordConfirmation(
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
                      setShowConfirmation(
                        current =>
                          !current
                      )
                    }
                  >
                    {showConfirmation ? (
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

                    Mendaftarkan...
                  </>
                ) : (
                  'Daftar Sekarang'
                )}
              </button>

            </form>


            <p className="auth-switch">
              Sudah punya akun?{' '}

              <Link to="/login">
                Masuk di sini
              </Link>
            </p>

          </div>
        </section>

      </div>
    </div>
  );
}