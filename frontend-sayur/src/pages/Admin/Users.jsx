import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import api from '../../api';

import {
  IconAlertCircle,
  IconCheck,
  IconCircleCheck,
  IconEye,
  IconLoader2,
  IconMail,
  IconMapPin,
  IconPhone,
  IconRefresh,
  IconSearch,
  IconShield,
  IconUser,
  IconUsers,
  IconUserCheck,
  IconUserX,
  IconX
} from '@tabler/icons-react';

import './Users.css';

export default function Users() {
  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [toast, setToast] =
    useState(null);

  const [search, setSearch] =
    useState('');

  const [roleFilter, setRoleFilter] =
    useState('ALL');

  const [
    verificationFilter,
    setVerificationFilter
  ] = useState('ALL');

  const [
    selectedUser,
    setSelectedUser
  ] = useState(null);
const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await api.get(
          '/users/admin/users'
        );

      const data =
        response.data?.data;

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        'Gagal mengambil users:',
        err.response?.data || err
      );

      const message =
        err.response?.data?.message ||
        err.response?.data?.massage ||
        'Data pengguna gagal dimuat.';

      setError(message);

      showToast(
        message,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);
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
const normalizeRole = (
    role
  ) => {
    return String(
      role || ''
    )
      .trim()
      .toLowerCase();
  };

  const getRoleInfo = (
    role
  ) => {
    const normalized =
      normalizeRole(role);

    if (
      normalized === 'super admin' ||
      normalized === 'superadmin' ||
      normalized === 'admin'
    ) {
      return {
        label:
          role || 'Super Admin',

        className:
          'users-role-admin',

        icon:
          IconShield
      };
    }

    return {
      label:
        role || 'Customer',

      className:
        'users-role-customer',

      icon:
        IconUser
    };
  };
const roles =
    useMemo(() => {
      const values =
        users
          .map(
            (user) =>
              user.role
          )
          .filter(Boolean);

      return [
        ...new Set(values)
      ].sort();
    }, [users]);
const filteredUsers =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {
          const matchesSearch =
            [
              user.id,
              user.name,
              user.email,
              user.phone,
              user.address,
              user.role
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(
                keyword
              );

          const matchesRole =
            roleFilter ===
              'ALL' ||
            String(
              user.role || ''
            ) ===
              roleFilter;

          const verified =
            Boolean(
              user.is_verified
            );

          const matchesVerification =
            verificationFilter ===
              'ALL' ||
            (
              verificationFilter ===
                'VERIFIED' &&
              verified
            ) ||
            (
              verificationFilter ===
                'UNVERIFIED' &&
              !verified
            );

          return (
            matchesSearch &&
            matchesRole &&
            matchesVerification
          );
        }
      );
    }, [
      users,
      search,
      roleFilter,
      verificationFilter
    ]);
const stats =
    useMemo(() => {
      const total =
        users.length;

      const admins =
        users.filter(
          (user) => {
            const role =
              normalizeRole(
                user.role
              );

            return (
              role === 'admin' ||
              role ===
                'super admin' ||
              role ===
                'superadmin'
            );
          }
        ).length;

      const customers =
        users.filter(
          (user) => {
            const role =
              normalizeRole(
                user.role
              );

            return ![
              'admin',
              'super admin',
              'superadmin'
            ].includes(role);
          }
        ).length;

      const verified =
        users.filter(
          (user) =>
            Boolean(
              user.is_verified
            )
        ).length;

      return {
        total,
        admins,
        customers,
        verified
      };
    }, [users]);

  return (
    <div className="users-page">
{toast && (
        <div
          className={
            toast.type ===
            'error'
              ? 'users-toast users-toast-error'
              : 'users-toast'
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
<header className="users-header">

        <div>
          <span className="users-eyebrow">
            User Management
          </span>

          <h1>
            Kelola Pengguna
          </h1>

          <p>
            Pantau akun customer
            dan administrator
            Sayur-day.
          </p>
        </div>

        <button
          type="button"
          className="users-refresh"
          onClick={
            loadUsers
          }
          disabled={
            loading
          }
        >
          <IconRefresh
            size={17}
            className={
              loading
                ? 'users-spin'
                : ''
            }
          />

          Refresh
        </button>

      </header>
{error && (
        <div className="users-error">
          <IconAlertCircle
            size={19}
          />

          <div>
            <strong>
              Gagal memuat pengguna
            </strong>

            <span>
              {error}
            </span>
          </div>
        </div>
      )}
<section className="users-stats">

        <UserStat
          title="Total Pengguna"
          value={stats.total}
          icon={
            <IconUsers
              size={22}
            />
          }
          type="green"
        />

        <UserStat
          title="Customer"
          value={
            stats.customers
          }
          icon={
            <IconUser
              size={22}
            />
          }
          type="blue"
        />

        <UserStat
          title="Administrator"
          value={
            stats.admins
          }
          icon={
            <IconShield
              size={22}
            />
          }
          type="purple"
        />

        <UserStat
          title="Terverifikasi"
          value={
            stats.verified
          }
          icon={
            <IconUserCheck
              size={22}
            />
          }
          type="orange"
        />

      </section>
<section className="users-card">

        <div className="users-card-header">

          <div>
            <h2>
              Daftar Pengguna
            </h2>

            <p>
              {filteredUsers.length}{' '}
              dari{' '}
              {users.length}{' '}
              pengguna.
            </p>
          </div>

          <div className="users-tools">

            <div className="users-search">
              <IconSearch
                size={17}
              />

              <input
                type="text"
                placeholder="Cari nama, email, ID..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />
            </div>

            <select
              className="users-filter"
              value={
                roleFilter
              }
              onChange={(event) =>
                setRoleFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                Semua Role
              </option>

              {roles.map(
                (role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                )
              )}
            </select>

            <select
              className="users-filter"
              value={
                verificationFilter
              }
              onChange={(event) =>
                setVerificationFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                Semua Status
              </option>

              <option value="VERIFIED">
                Terverifikasi
              </option>

              <option value="UNVERIFIED">
                Belum Verifikasi
              </option>
            </select>

          </div>

        </div>
{loading ? (
          <div className="users-state">

            <IconLoader2
              size={32}
              className="users-spin"
            />

            <strong>
              Memuat pengguna...
            </strong>

            <span>
              Mengambil data dari
              user-service.
            </span>

          </div>
        ) : filteredUsers.length ===
          0 ? (
          <div className="users-state">

            <div className="users-state-icon">
              <IconUsers
                size={29}
              />
            </div>

            <strong>
              Pengguna tidak ditemukan
            </strong>

            <span>
              Coba ubah pencarian
              atau filter.
            </span>

          </div>
        ) : (
          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>
                <tr>
                  <th>
                    Pengguna
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Kontak
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    ID
                  </th>

                  <th>
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(
                  (user) => {
                    const roleInfo =
                      getRoleInfo(
                        user.role
                      );

                    const RoleIcon =
                      roleInfo.icon;

                    return (
                      <tr
                        key={
                          user.id
                        }
                      >

                        <td>
                          <div className="users-user-cell">

                            <div className="users-avatar">
                              {user.photo ? (
                                <img
                                  src={
                                    user.photo
                                  }
                                  alt={
                                    user.name
                                  }
                                />
                              ) : (
                                <IconUser
                                  size={21}
                                />
                              )}
                            </div>

                            <div>
                              <strong>
                                {user.name ||
                                  'Tanpa Nama'}
                              </strong>

                              <span>
                                {user.email ||
                                  '-'}
                              </span>
                            </div>

                          </div>
                        </td>

                        <td>
                          <span
                            className={`users-role ${roleInfo.className}`}
                          >
                            <RoleIcon
                              size={14}
                            />

                            {
                              roleInfo.label
                            }
                          </span>
                        </td>

                        <td>
                          <div className="users-contact">

                            <span>
                              <IconMail
                                size={14}
                              />

                              {user.email ||
                                '-'}
                            </span>

                            <span>
                              <IconPhone
                                size={14}
                              />

                              {user.phone ||
                                'Belum ada'}
                            </span>

                          </div>
                        </td>

                        <td>
                          {user.is_verified ? (
                            <span className="users-verified">
                              <IconCircleCheck
                                size={14}
                              />

                              Terverifikasi
                            </span>
                          ) : (
                            <span className="users-unverified">
                              <IconUserX
                                size={14}
                              />

                              Belum
                              Verifikasi
                            </span>
                          )}
                        </td>

                        <td>
                          <span className="users-id">
                            #{user.id}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="users-detail-button"
                            onClick={() =>
                              setSelectedUser(
                                user
                              )
                            }
                            title="Detail pengguna"
                          >
                            <IconEye
                              size={16}
                            />
                          </button>
                        </td>

                      </tr>
                    );
                  }
                )}
              </tbody>

            </table>

          </div>
        )}

      </section>
{selectedUser && (
        <div
          className="users-modal-backdrop"
          onClick={() =>
            setSelectedUser(
              null
            )
          }
        >

          <div
            className="users-detail-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="users-modal-header">

              <div>
                <span>
                  Detail Pengguna
                </span>

                <h2>
                  {selectedUser.name ||
                    'Pengguna'}
                </h2>

                <p>
                  Informasi akun
                  pengguna Sayur-day.
                </p>
              </div>

              <button
                type="button"
                className="users-modal-close"
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
              >
                <IconX
                  size={19}
                />
              </button>

            </div>

            <div className="users-profile">

              <div className="users-profile-avatar">

                {selectedUser.photo ? (
                  <img
                    src={
                      selectedUser.photo
                    }
                    alt={
                      selectedUser.name
                    }
                  />
                ) : (
                  <IconUser
                    size={35}
                  />
                )}

              </div>

              <div>
                <h3>
                  {selectedUser.name ||
                    'Tanpa Nama'}
                </h3>

                <span>
                  ID Pengguna #
                  {selectedUser.id}
                </span>
              </div>

            </div>

            <div className="users-detail-grid">

              <UserDetailItem
                icon={
                  <IconMail
                    size={19}
                  />
                }
                label="Email"
                value={
                  selectedUser.email ||
                  '-'
                }
              />

              <UserDetailItem
                icon={
                  <IconPhone
                    size={19}
                  />
                }
                label="Nomor Telepon"
                value={
                  selectedUser.phone ||
                  'Belum diisi'
                }
              />

              <UserDetailItem
                icon={
                  <IconShield
                    size={19}
                  />
                }
                label="Role"
                value={
                  selectedUser.role ||
                  'Customer'
                }
              />

              <UserDetailItem
                icon={
                  selectedUser.is_verified
                    ? (
                      <IconUserCheck
                        size={19}
                      />
                    )
                    : (
                      <IconUserX
                        size={19}
                      />
                    )
                }
                label="Status Akun"
                value={
                  selectedUser.is_verified
                    ? 'Terverifikasi'
                    : 'Belum Terverifikasi'
                }
              />

            </div>

            <div className="users-address">

              <IconMapPin
                size={20}
              />

              <div>
                <strong>
                  Alamat
                </strong>

                <p>
                  {selectedUser.address ||
                    'Alamat belum diisi.'}
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
function UserStat({
  title,
  value,
  icon,
  type
}) {
  return (
    <article className="users-stat-card">

      <span
        className={`users-stat-icon ${type}`}
      >
        {icon}
      </span>

      <div>
        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>
      </div>

    </article>
  );
}
function UserDetailItem({
  icon,
  label,
  value
}) {
  return (
    <div className="users-detail-item">

      <div className="users-detail-icon">
        {icon}
      </div>

      <div>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>

    </div>
  );
}