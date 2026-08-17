import React, {
  useEffect,
  useState
} from 'react';

import api from '../api';

import {
  IconAlertCircle,
  IconCamera,
  IconCheck,
  IconCircleCheck,
  IconLoader2,
  IconMail,
  IconMapPin,
  IconPhone,
  IconShield,
  IconUser
} from '@tabler/icons-react';

import './Profile.css';

export default function Profile() {
  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [toast, setToast] =
    useState(null);

  const [name, setName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [address, setAddress] =
    useState('');

  const [photo, setPhoto] =
    useState('');

  // =========================================
  // LOAD
  // =========================================

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response =
        await api.get(
          '/users/profile'
        );

      const data =
        response.data?.data;

      setProfile(data);

      setName(
        data?.name || ''
      );

      setPhone(
        data?.phone || ''
      );

      setAddress(
        data?.address || ''
      );

      setPhoto(
        data?.photo || ''
      );
    } catch (err) {
      console.error(
        'Gagal mengambil profile:',
        err.response?.data || err
      );

      showToast(
        err.response?.data?.message ||
          err.response?.data?.massage ||
          'Gagal memuat profile.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // =========================================
  // TOAST
  // =========================================

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
      3000
    );
  };

  // =========================================
  // PHOTO
  // =========================================

  const handlePhotoChange = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowed.includes(
      file.type
    )) {
      showToast(
        'Foto harus JPG, PNG, atau WEBP.',
        'error'
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      showToast(
        'Ukuran foto maksimal 5 MB.',
        'error'
      );

      return;
    }

    try {
      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        'photo',
        file
      );

      const response =
        await api.post(
          '/users/profile/photo',
          formData
        );

      const url =
        response.data?.data?.url;

      if (!url) {
        throw new Error(
          'URL foto tidak diterima.'
        );
      }

      setPhoto(url);

      showToast(
        'Foto siap disimpan.'
      );
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          err.message ||
          'Gagal upload foto.',
        'error'
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================================
  // SAVE
  // =========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const cleanName =
      name.trim();

    if (!cleanName) {
      showToast(
        'Nama wajib diisi.',
        'error'
      );

      return;
    }

    try {
      setSaving(true);

      const response =
        await api.patch(
          '/users/profile',
          {
            name:
              cleanName,

            phone:
              phone.trim(),

            address:
              address.trim(),

            photo
          }
        );

      const updated =
        response.data?.data;

      if (updated) {
        setProfile(updated);

        setPhoto(
          updated.photo || ''
        );
      }

      showToast(
        'Profil berhasil diperbarui.'
      );
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          err.response?.data?.massage ||
          'Gagal memperbarui profil.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <IconLoader2
          size={34}
          className="profile-spin"
        />

        <strong>
          Memuat profil...
        </strong>
      </div>
    );
  }

  return (
    <main className="profile-page">

      {toast && (
        <div
          className={
            toast.type ===
            'error'
              ? 'profile-toast profile-toast-error'
              : 'profile-toast'
          }
        >
          {toast.type ===
          'error' ? (
            <IconAlertCircle
              size={18}
            />
          ) : (
            <IconCheck
              size={18}
            />
          )}

          {toast.message}
        </div>
      )}

      <div className="profile-container">

        <header className="profile-header">
          <span>
            Akun Saya
          </span>

          <h1>
            Profil Saya
          </h1>

          <p>
            Kelola informasi pribadi
            dan alamat pengiriman.
          </p>
        </header>

        <div className="profile-layout">

          {/* LEFT */}

          <aside className="profile-sidebar">

            <div className="profile-photo-wrapper">

              <div className="profile-photo">

                {photo ? (
                  <img
                    src={photo}
                    alt={
                      profile?.name ||
                      'Profile'
                    }
                  />
                ) : (
                  <IconUser
                    size={50}
                  />
                )}

              </div>

              <label className="profile-photo-button">

                {uploading ? (
                  <IconLoader2
                    size={17}
                    className="profile-spin"
                  />
                ) : (
                  <IconCamera
                    size={17}
                  />
                )}

                <span>
                  {uploading
                    ? 'Mengupload...'
                    : 'Ganti Foto'}
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={
                    uploading ||
                    saving
                  }
                  onChange={
                    handlePhotoChange
                  }
                />

              </label>

            </div>

            <h2>
              {profile?.name ||
                'Pengguna'}
            </h2>

            <p className="profile-email">
              {profile?.email}
            </p>

            <div className="profile-badges">

              <span className="profile-role">
                <IconShield
                  size={14}
                />

                {profile?.role ||
                  'Customer'}
              </span>

              {profile?.is_verified && (
                <span className="profile-verified">
                  <IconCircleCheck
                    size={14}
                  />

                  Terverifikasi
                </span>
              )}

            </div>

          </aside>

          {/* RIGHT */}

          <section className="profile-card">

            <div className="profile-card-header">
              <h2>
                Informasi Pribadi
              </h2>

              <p>
                Email tidak dapat
                diubah dari halaman ini.
              </p>
            </div>

            <form
              className="profile-form"
              onSubmit={
                handleSubmit
              }
            >

              <div className="profile-field">
                <label>
                  Nama Lengkap
                </label>

                <div className="profile-input-wrapper">
                  <IconUser
                    size={18}
                  />

                  <input
                    type="text"
                    value={name}
                    disabled={saving}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="profile-field">
                <label>
                  Email
                </label>

                <div className="profile-input-wrapper disabled">
                  <IconMail
                    size={18}
                  />

                  <input
                    type="email"
                    value={
                      profile?.email ||
                      ''
                    }
                    disabled
                  />
                </div>
              </div>

              <div className="profile-field">
                <label>
                  Nomor Telepon
                </label>

                <div className="profile-input-wrapper">
                  <IconPhone
                    size={18}
                  />

                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    disabled={saving}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="profile-field profile-field-full">
                <label>
                  Alamat Pengiriman
                </label>

                <div className="profile-textarea-wrapper">
                  <IconMapPin
                    size={18}
                  />

                  <textarea
                    rows={4}
                    placeholder="Masukkan alamat lengkap..."
                    value={address}
                    disabled={saving}
                    onChange={(e) =>
                      setAddress(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="profile-actions">

                <button
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <IconLoader2
                        size={18}
                        className="profile-spin"
                      />

                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <IconCheck
                        size={18}
                      />

                      Simpan Perubahan
                    </>
                  )}
                </button>

              </div>

            </form>

          </section>

        </div>

      </div>
    </main>
  );
}
