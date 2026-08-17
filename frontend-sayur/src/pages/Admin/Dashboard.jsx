import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Link
} from 'react-router-dom';

import api from '../../api';

import {
  useAuth
} from '../../context/AuthContext';

import {
  IconAlertCircle,
  IconArrowRight,
  IconClock,
  IconCreditCard,
  IconLoader2,
  IconPackage,
  IconReceipt,
  IconRefresh,
  IconShoppingBag,
  IconTruck,
  IconTrendingUp
} from '@tabler/icons-react';

import './Dashboard.css';


export default function Dashboard() {
  const {
    token,
    user
  } = useAuth();

  const [
    products,
    setProducts
  ] = useState([]);

  const [
    orders,
    setOrders
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState('');


  // =========================================
  // LOAD DASHBOARD
  // =========================================

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        productResponse,
        orderResponse
      ] = await Promise.all([
        api.get('/products'),

        api.get(
          '/orders',
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        )
      ]);

      const productData =
        Array.isArray(
          productResponse.data
        )
          ? productResponse.data
          : productResponse.data
              ?.data;

      const orderData =
        Array.isArray(
          orderResponse.data
        )
          ? orderResponse.data
          : orderResponse.data
              ?.data;

      setProducts(
        Array.isArray(
          productData
        )
          ? productData
          : []
      );

      setOrders(
        Array.isArray(
          orderData
        )
          ? orderData
          : []
      );

    } catch (err) {
      console.error(
        'Gagal memuat dashboard:',
        err.response?.data || err
      );

      setError(
        err.response?.data
          ?.message ||
        'Data dashboard gagal dimuat.'
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDashboardStats();
  }, [token]);


  // =========================================
  // STATS
  // =========================================

  const stats =
    useMemo(() => {
      const totalProducts =
        products.length;

      const totalOrders =
        orders.length;

      const pendingOrders =
        orders.filter(
          (order) =>
            String(
              order.status || ''
            ).toUpperCase() ===
            'PENDING'
        ).length;

      const paidStatuses = [
        'PAID',
        'PROCESSING',
        'SHIPPED',
        'DONE'
      ];

      const totalRevenue =
        orders.reduce(
          (
            total,
            order
          ) => {
            const status =
              String(
                order.status || ''
              ).toUpperCase();

            if (
              !paidStatuses.includes(
                status
              )
            ) {
              return total;
            }

            return (
              total +
              Number(
                order.total_price ||
                0
              )
            );
          },
          0
        );

      return {
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue
      };
    }, [
      products,
      orders
    ]);


  // =========================================
  // ORDER STATUS SUMMARY
  // =========================================

  const statusSummary =
    useMemo(() => {
      const countStatus = (
        statuses
      ) =>
        orders.filter(
          (order) =>
            statuses.includes(
              String(
                order.status ||
                ''
              ).toUpperCase()
            )
        ).length;

      return {
        pending:
          countStatus([
            'PENDING'
          ]),

        paid:
          countStatus([
            'PAID'
          ]),

        processing:
          countStatus([
            'PROCESSING'
          ]),

        shipped:
          countStatus([
            'SHIPPED'
          ]),

        done:
          countStatus([
            'DONE'
          ])
      };
    }, [orders]);


  // =========================================
  // RECENT ORDERS
  // =========================================

  const recentOrders =
    useMemo(() => {
      return [...orders]
        .sort(
          (a, b) =>
            new Date(
              b.created_at || 0
            ) -
            new Date(
              a.created_at || 0
            )
        )
        .slice(0, 5);
    }, [orders]);


  // =========================================
  // HELPERS
  // =========================================

  const formatRupiah = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString(
      'id-ID'
    );


  const formatDate = (
    value
  ) => {
    if (!value) {
      return '-';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '-';
    }

    return date.toLocaleDateString(
      'id-ID',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    );
  };


  const getStatusClass = (
    status
  ) => {
    const value =
      String(
        status || 'PENDING'
      ).toUpperCase();

    if (
      value === 'PAID'
    ) {
      return 'dashboard-status-paid';
    }

    if (
      value ===
      'PROCESSING'
    ) {
      return 'dashboard-status-processing';
    }

    if (
      value === 'SHIPPED'
    ) {
      return 'dashboard-status-shipped';
    }

    if (
      value === 'DONE'
    ) {
      return 'dashboard-status-done';
    }

    if (
      value ===
      'CANCELLED'
    ) {
      return 'dashboard-status-cancelled';
    }

    return 'dashboard-status-pending';
  };


  const getStatusLabel = (
    status
  ) => {
    const value =
      String(
        status || 'PENDING'
      ).toUpperCase();

    const labels = {
      PENDING:
        'Belum Bayar',

      PAID:
        'Sudah Dibayar',

      PROCESSING:
        'Diproses',

      SHIPPED:
        'Dikirim',

      DONE:
        'Selesai',

      CANCELLED:
        'Dibatalkan'
    };

    return (
      labels[value] ||
      value
    );
  };


  return (
    <div className="dashboard-page">

      {/* ==================================
          HEADER
      ================================== */}

      <header className="dashboard-header">

        <div>
          <span className="dashboard-eyebrow">
            Overview
          </span>

          <h1>
            Dashboard
          </h1>

          <p>
            Selamat datang
            {user?.name
              ? `, ${user.name}`
              : ''}
            . Pantau performa toko
            Sayur-day dari sini.
          </p>
        </div>


        <button
          type="button"
          className="dashboard-refresh"
          onClick={
            loadDashboardStats
          }
          disabled={loading}
        >
          <IconRefresh
            size={16}
            className={
              loading
                ? 'dashboard-spin'
                : ''
            }
          />

          Refresh Data
        </button>

      </header>


      {/* ==================================
          ERROR
      ================================== */}

      {error && (
        <div className="dashboard-error">
          <IconAlertCircle
            size={19}
          />

          <div>
            <strong>
              Gagal memuat dashboard
            </strong>

            <span>
              {error}
            </span>
          </div>
        </div>
      )}


      {/* ==================================
          LOADING
      ================================== */}

      {loading ? (
        <div className="dashboard-loading">
          <IconLoader2
            size={30}
            className="dashboard-spin"
          />

          <strong>
            Memuat dashboard...
          </strong>

          <span>
            Mengambil data terbaru
            dari server.
          </span>
        </div>
      ) : (
        <>

          {/* ================================
              STAT CARDS
          ================================ */}

          <section className="dashboard-stats">

            <StatCard
              icon={
                <IconPackage
                  size={22}
                />
              }
              type="product"
              title="Total Produk"
              value={
                stats.totalProducts
              }
              description="Produk tersedia di katalog"
            />


            <StatCard
              icon={
                <IconReceipt
                  size={22}
                />
              }
              type="order"
              title="Total Pesanan"
              value={
                stats.totalOrders
              }
              description="Seluruh transaksi masuk"
            />


            <StatCard
              icon={
                <IconClock
                  size={22}
                />
              }
              type="pending"
              title="Belum Dibayar"
              value={
                stats.pendingOrders
              }
              description="Pesanan status pending"
            />


            <StatCard
              icon={
                <IconTrendingUp
                  size={22}
                />
              }
              type="revenue"
              title="Pendapatan"
              value={`Rp ${formatRupiah(
                stats.totalRevenue
              )}`}
              description="Dari pesanan yang sudah dibayar"
              revenue
            />

          </section>


          {/* ================================
              MAIN GRID
          ================================ */}

          <div className="dashboard-grid">

            {/* ORDER STATUS */}

            <section className="dashboard-card">

              <div className="dashboard-card-header">
                <div>
                  <h2>
                    Status Pesanan
                  </h2>

                  <p>
                    Ringkasan seluruh
                    transaksi.
                  </p>
                </div>

                <Link
                  to="/admin/orders"
                >
                  Lihat Semua

                  <IconArrowRight
                    size={14}
                  />
                </Link>
              </div>


              <div className="dashboard-status-list">

                <StatusItem
                  icon={
                    <IconClock
                      size={18}
                    />
                  }
                  type="pending"
                  label="Menunggu Pembayaran"
                  value={
                    statusSummary.pending
                  }
                />

                <StatusItem
                  icon={
                    <IconCreditCard
                      size={18}
                    />
                  }
                  type="paid"
                  label="Sudah Dibayar"
                  value={
                    statusSummary.paid
                  }
                />

                <StatusItem
                  icon={
                    <IconPackage
                      size={18}
                    />
                  }
                  type="processing"
                  label="Sedang Diproses"
                  value={
                    statusSummary.processing
                  }
                />

                <StatusItem
                  icon={
                    <IconTruck
                      size={18}
                    />
                  }
                  type="shipped"
                  label="Sedang Dikirim"
                  value={
                    statusSummary.shipped
                  }
                />

                <StatusItem
                  icon={
                    <IconShoppingBag
                      size={18}
                    />
                  }
                  type="done"
                  label="Pesanan Selesai"
                  value={
                    statusSummary.done
                  }
                />

              </div>

            </section>


            {/* QUICK ACTION */}

            <section className="dashboard-card">

              <div className="dashboard-card-header">
                <div>
                  <h2>
                    Akses Cepat
                  </h2>

                  <p>
                    Kelola toko dari
                    satu tempat.
                  </p>
                </div>
              </div>


              <div className="dashboard-actions">

                <Link
                  to="/admin/products"
                  className="dashboard-action"
                >
                  <span className="dashboard-action-icon products">
                    <IconPackage
                      size={21}
                    />
                  </span>

                  <div>
                    <strong>
                      Kelola Produk
                    </strong>

                    <p>
                      Tambah, edit,
                      stok dan harga
                      produk.
                    </p>
                  </div>

                  <IconArrowRight
                    size={17}
                  />
                </Link>


                <Link
                  to="/admin/orders"
                  className="dashboard-action"
                >
                  <span className="dashboard-action-icon orders">
                    <IconShoppingBag
                      size={21}
                    />
                  </span>

                  <div>
                    <strong>
                      Kelola Pesanan
                    </strong>

                    <p>
                      Lihat transaksi dan
                      status pesanan.
                    </p>
                  </div>

                  <IconArrowRight
                    size={17}
                  />
                </Link>

              </div>

            </section>

          </div>


          {/* ================================
              RECENT ORDERS
          ================================ */}

          <section className="dashboard-card dashboard-recent">

            <div className="dashboard-card-header">
              <div>
                <h2>
                  Pesanan Terbaru
                </h2>

                <p>
                  5 transaksi terbaru
                  yang masuk.
                </p>
              </div>

              <Link
                to="/admin/orders"
              >
                Kelola Pesanan

                <IconArrowRight
                  size={14}
                />
              </Link>
            </div>


            {recentOrders.length ===
            0 ? (
              <div className="dashboard-empty">
                <IconReceipt
                  size={27}
                />

                <strong>
                  Belum ada pesanan
                </strong>

                <span>
                  Pesanan customer akan
                  muncul di sini.
                </span>
              </div>
            ) : (
              <div className="dashboard-table-wrapper">

                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>
                        Pesanan
                      </th>

                      <th>
                        Tanggal
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map(
                      (order) => (
                        <tr
                          key={
                            order.id
                          }
                        >
                          <td>
                            <strong>
                              #ORD-
                              {order.id}
                            </strong>
                          </td>

                          <td>
                            {formatDate(
                              order.created_at
                            )}
                          </td>

                          <td>
                            <span
                              className={`dashboard-order-status ${getStatusClass(
                                order.status
                              )}`}
                            >
                              {getStatusLabel(
                                order.status
                              )}
                            </span>
                          </td>

                          <td>
                            <strong className="dashboard-order-price">
                              Rp{' '}
                              {formatRupiah(
                                order.total_price
                              )}
                            </strong>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>

              </div>
            )}

          </section>

        </>
      )}

    </div>
  );
}


// =========================================
// STAT CARD
// =========================================

function StatCard({
  icon,
  type,
  title,
  value,
  description,
  revenue = false
}) {
  return (
    <article className="dashboard-stat-card">

      <span
        className={`dashboard-stat-icon ${type}`}
      >
        {icon}
      </span>


      <div className="dashboard-stat-content">

        <span>
          {title}
        </span>

        <strong
          className={
            revenue
              ? 'dashboard-stat-revenue'
              : ''
          }
        >
          {value}
        </strong>

        <small>
          {description}
        </small>

      </div>

    </article>
  );
}


// =========================================
// STATUS ITEM
// =========================================

function StatusItem({
  icon,
  type,
  label,
  value
}) {
  return (
    <div className="dashboard-status-item">

      <span
        className={`dashboard-status-icon ${type}`}
      >
        {icon}
      </span>

      <strong>
        {label}
      </strong>

      <span className="dashboard-status-value">
        {value}
      </span>

    </div>
  );
}
