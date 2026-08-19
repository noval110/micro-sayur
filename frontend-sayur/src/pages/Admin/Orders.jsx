import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import './Orders.css';

import {
  IconAlertTriangle,
  IconCheck,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconCreditCard,
  IconEye,
  IconFilter,
  IconMapPin,
  IconPackage,
  IconRefresh,
  IconSearch,
  IconShoppingBag,
  IconTruck,
  IconUser,
  IconX,
  IconLoader2,
  IconNotes,
  IconCalendar
} from '@tabler/icons-react';

const ACTION_CONFIG = {
  PROCESSING: {
    title: 'Proses Pesanan?',
    description:
      'Pesanan akan masuk ke tahap persiapan dan mulai diproses.',
    confirmText: 'Ya, Proses',
    icon: IconPackage,
    className: 'processing'
  },

  SHIPPED: {
    title: 'Kirim Pesanan?',
    description:
      'Pastikan pesanan sudah selesai disiapkan sebelum dikirim.',
    confirmText: 'Ya, Kirim',
    icon: IconTruck,
    className: 'shipped'
  },

  DONE: {
    title: 'Selesaikan Pesanan?',
    description:
      'Pastikan pesanan sudah diterima pelanggan sebelum menyelesaikan transaksi.',
    confirmText: 'Ya, Selesaikan',
    icon: IconCheck,
    className: 'done'
  },

  CANCELLED: {
    title: 'Batalkan Pesanan?',
    description:
      'Pesanan yang sudah dibatalkan tidak dapat diproses kembali.',
    confirmText: 'Ya, Batalkan',
    icon: IconAlertTriangle,
    className: 'cancelled'
  }
};

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Semua Status' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'PAID', label: 'Sudah Dibayar' },
  { value: 'PROCESSING', label: 'Diproses' },
  { value: 'SHIPPED', label: 'Dikirim' },
  { value: 'DONE', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' }
];

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    orderId: null,
    action: null
  });

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    loadOrders();
  }, []);
const showToast = (message, type = 'success') => {
    setToast({
      show: true,
      message,
      type
    });

    window.setTimeout(() => {
      setToast({
        show: false,
        message: '',
        type: 'success'
      });
    }, 3000);
  };
const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await api.get('/orders');

      const data = res.data?.data;

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        'Gagal mengambil orders:',
        err.response?.data || err
      );

      showToast(
        err.response?.data?.message ||
          'Gagal mengambil data pesanan.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
const updateOrderStatus = async (
    orderId,
    newStatus
  ) => {
    try {
      setActionLoading(true);

      await api.patch(
        `/orders/${orderId}/status`,
        {
          status: newStatus
        }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus
              }
            : order
        )
      );

      setSelectedOrder((prev) => {
        if (!prev || prev.id !== orderId) {
          return prev;
        }

        return {
          ...prev,
          status: newStatus
        };
      });

      showToast(
        `Status #ORD-${orderId} berhasil diperbarui.`
      );

      return true;
    } catch (err) {
      console.error(
        'Gagal update status:',
        err.response?.data || err
      );

      showToast(
        err.response?.data?.message ||
          'Gagal mengubah status pesanan.',
        'error'
      );

      return false;
    } finally {
      setActionLoading(false);
    }
  };
const formatRupiah = (value) => {
    return Number(value || 0).toLocaleString(
      'id-ID'
    );
  };

  const formatDate = (value) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
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

  const formatDateTime = (value) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleString(
      'id-ID',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };
const getStatusInfo = (status) => {
    const current = String(
      status || 'PENDING'
    ).toUpperCase();

    switch (current) {
      case 'PAID':
        return {
          label: 'Sudah Dibayar',
          className: 'paid',
          icon: IconCreditCard
        };

      case 'PROCESSING':
        return {
          label: 'Diproses',
          className: 'processing',
          icon: IconPackage
        };

      case 'SHIPPED':
        return {
          label: 'Sedang Dikirim',
          className: 'shipped',
          icon: IconTruck
        };

      case 'DONE':
        return {
          label: 'Selesai',
          className: 'done',
          icon: IconCheck
        };

      case 'CANCELLED':
        return {
          label: 'Dibatalkan',
          className: 'cancelled',
          icon: IconX
        };

      default:
        return {
          label: 'Menunggu',
          className: 'pending',
          icon: IconClock
        };
    }
  };

  const getAvailableActions = (status) => {
    const current = String(
      status || ''
    ).toUpperCase();

    if (current === 'PENDING') {
      return [
        {
          label: 'Batalkan',
          status: 'CANCELLED'
        }
      ];
    }

    if (current === 'PAID') {
      return [
        {
          label: 'Proses Pesanan',
          status: 'PROCESSING'
        },
        {
          label: 'Batalkan',
          status: 'CANCELLED'
        }
      ];
    }

    if (current === 'PROCESSING') {
      return [
        {
          label: 'Kirim Pesanan',
          status: 'SHIPPED'
        },
        {
          label: 'Batalkan',
          status: 'CANCELLED'
        }
      ];
    }

    if (current === 'SHIPPED') {
      return [
        {
          label: 'Selesaikan',
          status: 'DONE'
        }
      ];
    }

    return [];
  };
const openConfirmModal = (
    orderId,
    action
  ) => {
    setConfirmModal({
      show: true,
      orderId,
      action
    });
  };

  const closeConfirmModal = () => {
    if (actionLoading) {
      return;
    }

    setConfirmModal({
      show: false,
      orderId: null,
      action: null
    });
  };

  const handleConfirmAction = async () => {
    if (
      !confirmModal.orderId ||
      !confirmModal.action
    ) {
      return;
    }

    const success =
      await updateOrderStatus(
        confirmModal.orderId,
        confirmModal.action
      );

    if (success) {
      closeConfirmModal();
    }
  };
const summary = useMemo(() => {
    const total = orders.length;

    const pending = orders.filter(
      (order) =>
        String(order.status).toUpperCase() ===
        'PENDING'
    ).length;

    const processing = orders.filter(
      (order) =>
        ['PAID', 'PROCESSING'].includes(
          String(order.status).toUpperCase()
        )
    ).length;

    const shipped = orders.filter(
      (order) =>
        String(order.status).toUpperCase() ===
        'SHIPPED'
    ).length;

    const done = orders.filter(
      (order) =>
        String(order.status).toUpperCase() ===
        'DONE'
    ).length;

    return {
      total,
      pending,
      processing,
      shipped,
      done
    };
  }, [orders]);
const filteredOrders = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      const currentStatus =
        String(
          order.status || ''
        ).toUpperCase();

      const matchesStatus =
        statusFilter === 'ALL' ||
        currentStatus === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const productNames =
        Array.isArray(order.items)
          ? order.items
              .map(
                (item) =>
                  item.product_name || ''
              )
              .join(' ')
          : '';

      const searchable = [
        `ORD-${order.id}`,
        order.id,
        order.user_id,
        order.delivery_address,
        order.delivery_notes,
        productNames
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [
    orders,
    search,
    statusFilter
  ]);

  return (
    <div className="admin-orders-page">
{toast.show && (
        <div
          className={`admin-orders-toast ${toast.type}`}
        >
          {toast.type === 'error' ? (
            <IconAlertTriangle size={20} />
          ) : (
            <IconCircleCheck size={20} />
          )}

          <span>{toast.message}</span>
        </div>
      )}
<section className="orders-header">
        <div>
          <span className="orders-eyebrow">
            Manajemen Pesanan
          </span>

          <h1>Pesanan</h1>

          <p>
            Pantau dan kelola seluruh pesanan
            pelanggan Sayur-day.
          </p>
        </div>

        <button
          type="button"
          className="orders-refresh-btn"
          onClick={loadOrders}
          disabled={loading}
        >
          <IconRefresh
            size={18}
            className={
              loading
                ? 'orders-spinning'
                : ''
            }
          />

          Refresh
        </button>
      </section>
<section className="orders-summary-grid">
        <SummaryCard
          title="Total Pesanan"
          value={summary.total}
          icon={IconShoppingBag}
        />

        <SummaryCard
          title="Menunggu"
          value={summary.pending}
          icon={IconClock}
        />

        <SummaryCard
          title="Diproses"
          value={summary.processing}
          icon={IconPackage}
        />

        <SummaryCard
          title="Dikirim"
          value={summary.shipped}
          icon={IconTruck}
        />

        <SummaryCard
          title="Selesai"
          value={summary.done}
          icon={IconCheck}
        />
      </section>
<section className="orders-content-card">

        <div className="orders-toolbar">
          <div className="orders-search-box">
            <IconSearch size={18} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Cari ID, user, alamat atau produk..."
            />
          </div>

          <div className="orders-filter-box">
            <IconFilter size={18} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="orders-result-info">
          <span>
            Menampilkan{' '}
            <strong>
              {filteredOrders.length}
            </strong>{' '}
            dari{' '}
            <strong>
              {orders.length}
            </strong>{' '}
            pesanan
          </span>
        </div>
{loading && (
          <div className="orders-state">
            <IconLoader2
              size={36}
              className="orders-spinning"
            />

            <h3>
              Mengambil pesanan...
            </h3>

            <p>
              Tunggu sebentar.
            </p>
          </div>
        )}
{!loading &&
          filteredOrders.length === 0 && (
            <div className="orders-state">
              <div className="orders-state-icon">
                <IconShoppingBag
                  size={30}
                />
              </div>

              <h3>
                Pesanan tidak ditemukan
              </h3>

              <p>
                Coba ubah kata pencarian
                atau filter status.
              </p>
            </div>
          )}
{!loading &&
          filteredOrders.length > 0 && (
            <div className="orders-list">
              {filteredOrders.map(
                (order) => {
                  const statusInfo =
                    getStatusInfo(
                      order.status
                    );

                  const StatusIcon =
                    statusInfo.icon;

                  const actions =
                    getAvailableActions(
                      order.status
                    );

                  return (
                    <article
                      className="order-card"
                      key={order.id}
                    >
                      <div className="order-card-header">

                        <div className="order-main-info">
                          <div className="order-icon">
                            <IconShoppingBag
                              size={21}
                            />
                          </div>

                          <div>
                            <h3>
                              #ORD-
                              {order.id}
                            </h3>

                            <div className="order-meta">
                              <span>
                                <IconCalendar
                                  size={14}
                                />

                                {formatDate(
                                  order.created_at
                                )}
                              </span>

                              <span>
                                <IconUser
                                  size={14}
                                />

                                User #
                                {order.user_id}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`order-status ${statusInfo.className}`}
                        >
                          <StatusIcon
                            size={15}
                          />

                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="order-card-body">

                        <div className="order-products">

                          <div className="order-section-title">
                            Produk
                          </div>

                          {Array.isArray(
                            order.items
                          ) &&
                          order.items.length >
                            0 ? (
                            order.items
                              .slice(0, 3)
                              .map((item) => (
                                <div
                                  className="order-product-row"
                                  key={
                                    item.id
                                  }
                                >
                                  <div className="order-product-main">
                                    <div className="order-product-icon">
                                      <IconPackage
                                        size={
                                          17
                                        }
                                      />
                                    </div>

                                    <div>
                                      <strong>
                                        {item.product_name ||
                                          'Produk'}
                                      </strong>

                                      <span>
                                        {
                                          item.quantity
                                        }{' '}
                                        × Rp{' '}
                                        {formatRupiah(
                                          item.price
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  <strong className="order-product-total">
                                    Rp{' '}
                                    {formatRupiah(
                                      Number(
                                        item.price ||
                                          0
                                      ) *
                                        Number(
                                          item.quantity ||
                                            0
                                        )
                                    )}
                                  </strong>
                                </div>
                              ))
                          ) : (
                            <p className="order-empty-product">
                              Detail produk
                              tidak tersedia.
                            </p>
                          )}

                          {Array.isArray(
                            order.items
                          ) &&
                            order.items.length >
                              3 && (
                              <button
                                className="order-more-products"
                                type="button"
                                onClick={() =>
                                  setSelectedOrder(
                                    order
                                  )
                                }
                              >
                                +
                                {order.items
                                  .length -
                                  3}{' '}
                                produk lainnya
                              </button>
                            )}

                          <div className="order-address">
                            <IconMapPin
                              size={18}
                            />

                            <div>
                              <strong>
                                Alamat
                                Pengiriman
                              </strong>

                              <p>
                                {order.delivery_address ||
                                  '-'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="order-side">

                          <div>
                            <span className="order-total-label">
                              Total
                              Pembayaran
                            </span>

                            <strong className="order-total-value">
                              Rp{' '}
                              {formatRupiah(
                                order.total_price
                              )}
                            </strong>
                          </div>

                          <button
                            type="button"
                            className="order-detail-btn"
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                          >
                            <IconEye size={17} />

                            Detail Pesanan
                          </button>

                          {actions.length >
                            0 && (
                            <div className="order-actions">
                              {actions.map(
                                (action) => (
                                  <button
                                    type="button"
                                    key={
                                      action.status
                                    }
                                    className={
                                      action.status ===
                                      'CANCELLED'
                                        ? 'order-action-cancel'
                                        : 'order-action-primary'
                                    }
                                    onClick={() =>
                                      openConfirmModal(
                                        order.id,
                                        action.status
                                      )
                                    }
                                  >
                                    {
                                      action.label
                                    }

                                    {action.status !==
                                      'CANCELLED' && (
                                      <IconChevronRight
                                        size={
                                          16
                                        }
                                      />
                                    )}
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
      </section>
{selectedOrder && (
        <div
          className="orders-modal-overlay"
          onClick={() =>
            setSelectedOrder(null)
          }
        >
          <div
            className="orders-detail-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="orders-modal-header">
              <div>
                <span>
                  Detail Pesanan
                </span>

                <h2>
                  #ORD-
                  {selectedOrder.id}
                </h2>
              </div>

              <button
                type="button"
                className="orders-modal-close"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="order-detail-status-row">
              {(() => {
                const info =
                  getStatusInfo(
                    selectedOrder.status
                  );

                const StatusIcon =
                  info.icon;

                return (
                  <span
                    className={`order-status ${info.className}`}
                  >
                    <StatusIcon
                      size={15}
                    />

                    {info.label}
                  </span>
                );
              })()}

              <span className="order-detail-date">
                {formatDateTime(
                  selectedOrder.created_at
                )}
              </span>
            </div>

            <div className="order-detail-info-grid">

              <div className="order-detail-info-card">
                <IconUser size={20} />

                <div>
                  <span>
                    Pelanggan
                  </span>

                  <strong>
                    User #
                    {
                      selectedOrder.user_id
                    }
                  </strong>
                </div>
              </div>

              <div className="order-detail-info-card">
                <IconCreditCard
                  size={20}
                />

                <div>
                  <span>
                    Total Bayar
                  </span>

                  <strong>
                    Rp{' '}
                    {formatRupiah(
                      selectedOrder.total_price
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className="order-detail-section">
              <h3>
                Produk Pesanan
              </h3>

              <div className="order-detail-products">
                {Array.isArray(
                  selectedOrder.items
                ) &&
                selectedOrder.items
                  .length > 0 ? (
                  selectedOrder.items.map(
                    (item) => (
                      <div
                        className="order-detail-product"
                        key={item.id}
                      >
                        <div>
                          <strong>
                            {item.product_name ||
                              'Produk'}
                          </strong>

                          <span>
                            {item.quantity}{' '}
                            × Rp{' '}
                            {formatRupiah(
                              item.price
                            )}
                          </span>
                        </div>

                        <strong>
                          Rp{' '}
                          {formatRupiah(
                            Number(
                              item.price ||
                                0
                            ) *
                              Number(
                                item.quantity ||
                                  0
                              )
                          )}
                        </strong>
                      </div>
                    )
                  )
                ) : (
                  <p>
                    Detail produk
                    tidak tersedia.
                  </p>
                )}
              </div>
            </div>

            <div className="order-detail-section">
              <h3>
                Pengiriman
              </h3>

              <div className="order-detail-address">
                <IconMapPin size={20} />

                <div>
                  <strong>
                    Alamat
                  </strong>

                  <p>
                    {selectedOrder.delivery_address ||
                      '-'}
                  </p>
                </div>
              </div>

              {selectedOrder.delivery_notes && (
                <div className="order-detail-notes">
                  <IconNotes size={20} />

                  <div>
                    <strong>
                      Catatan
                    </strong>

                    <p>
                      {
                        selectedOrder.delivery_notes
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="order-detail-total">
              <span>
                Total Pembayaran
              </span>

              <strong>
                Rp{' '}
                {formatRupiah(
                  selectedOrder.total_price
                )}
              </strong>
            </div>
          </div>
        </div>
      )}
{confirmModal.show &&
        (() => {
          const config =
            ACTION_CONFIG[
              confirmModal.action
            ];

          if (!config) {
            return null;
          }

          const ActionIcon =
            config.icon;

          return (
            <div
              className="orders-modal-overlay"
              onClick={
                closeConfirmModal
              }
            >
              <div
                className="order-confirm-modal"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <div
                  className={`order-confirm-icon ${config.className}`}
                >
                  <ActionIcon
                    size={30}
                  />
                </div>

                <h2>
                  {config.title}
                </h2>

                <p className="order-confirm-order">
                  Pesanan{' '}
                  <strong>
                    #ORD-
                    {
                      confirmModal.orderId
                    }
                  </strong>
                </p>

                <p className="order-confirm-description">
                  {config.description}
                </p>

                <div className="order-confirm-actions">
                  <button
                    type="button"
                    className="order-confirm-back"
                    disabled={
                      actionLoading
                    }
                    onClick={
                      closeConfirmModal
                    }
                  >
                    Kembali
                  </button>

                  <button
                    type="button"
                    className={`order-confirm-submit ${config.className}`}
                    disabled={
                      actionLoading
                    }
                    onClick={
                      handleConfirmAction
                    }
                  >
                    {actionLoading ? (
                      <>
                        <IconLoader2
                          size={18}
                          className="orders-spinning"
                        />

                        Memproses...
                      </>
                    ) : (
                      <>
                        <ActionIcon
                          size={18}
                        />

                        {
                          config.confirmText
                        }
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
function SummaryCard({
  title,
  value,
  icon: Icon
}) {
  return (
    <div className="orders-summary-card">
      <div className="orders-summary-icon">
        <Icon size={22} />
      </div>

      <div>
        <strong>
          {value}
        </strong>

        <span>
          {title}
        </span>
      </div>
    </div>
  );
}
