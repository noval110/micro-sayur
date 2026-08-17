import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import Navbar from '../components/Navbar';
import api from '../api';

import {
  useAuth
} from '../context/AuthContext';

import {
  IconBuildingBank,
  IconCheck,
  IconCircleCheck,
  IconClock,
  IconCopy,
  IconCreditCard,
  IconDeviceMobile,
  IconLoader2,
  IconMapPin,
  IconPackage,
  IconQrcode,
  IconReceipt,
  IconRefresh,
  IconShieldCheck,
  IconTruck,
  IconWallet,
  IconX
} from '@tabler/icons-react';

import './MyOrders.css';


const FILTERS = [
  {
    value: 'ALL',
    label: 'Semua'
  },
  {
    value: 'PENDING',
    label: 'Belum Bayar'
  },
  {
    value: 'PROCESS',
    label: 'Diproses'
  },
  {
    value: 'SHIPPED',
    label: 'Dikirim'
  },
  {
    value: 'DONE',
    label: 'Selesai'
  }
];


export default function MyOrders() {
  const {
    token,
    isAuthenticated
  } = useAuth();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [
    activeFilter,
    setActiveFilter
  ] = useState('ALL');

  const [
    selectedOrder,
    setSelectedOrder
  ] = useState(null);

  const [
    selectedMethod,
    setSelectedMethod
  ] = useState('QRIS');

  const [
    paymentLoading,
    setPaymentLoading
  ] = useState(false);

  const [
    paymentDetail,
    setPaymentDetail
  ] = useState(null);

  const [
    paymentDetailLoading,
    setPaymentDetailLoading
  ] = useState(null);

  const [copied, setCopied] =
    useState(false);

  const [toast, setToast] =
    useState({
      show: false,
      message: '',
      type: 'success'
    });


  // ========================================
  // FETCH
  // ========================================

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [
    isAuthenticated,
    token
  ]);


  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await api.get(
          '/orders/my',
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const data =
        response.data?.data;

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      console.error(
        'Gagal mengambil pesanan:',
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
        'Gagal mengambil data pesanan.'
      );

    } finally {
      setLoading(false);
    }
  };


  // ========================================
  // TOAST
  // ========================================

  const showToast = (
    message,
    type = 'success'
  ) => {
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
    }, 3500);
  };


  // ========================================
  // FORMAT
  // ========================================

  const formatRupiah = (value) =>
    Number(
      value || 0
    ).toLocaleString(
      'id-ID'
    );


  const formatDate = (date) => {
    if (!date) return '-';

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return '-';
    }

    return parsed.toLocaleDateString(
      'id-ID',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    );
  };


  const formatDateTime = (date) => {
    if (!date) return '-';

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return '-';
    }

    return parsed.toLocaleString(
      'id-ID',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };


  // ========================================
  // STATUS
  // ========================================

  const getStatus = (status) => {
    const value =
      String(
        status || 'PENDING'
      ).toUpperCase();

    if (value === 'DONE') {
      return {
        label: 'Selesai',
        className:
          'orders-status-done',
        icon:
          <IconCheck size={14} />
      };
    }

    if (value === 'SHIPPED') {
      return {
        label: 'Sedang Dikirim',
        className:
          'orders-status-shipped',
        icon:
          <IconTruck size={14} />
      };
    }

    if (
      value === 'PROCESSING'
    ) {
      return {
        label: 'Sedang Diproses',
        className:
          'orders-status-processing',
        icon:
          <IconPackage size={14} />
      };
    }

    if (value === 'PAID') {
      return {
        label: 'Sudah Dibayar',
        className:
          'orders-status-paid',
        icon:
          <IconCreditCard
            size={14}
          />
      };
    }

    if (
      value === 'CANCELLED'
    ) {
      return {
        label: 'Dibatalkan',
        className:
          'orders-status-cancelled',
        icon:
          <IconX size={14} />
      };
    }

    return {
      label:
        'Menunggu Pembayaran',

      className:
        'orders-status-pending',

      icon:
        <IconClock size={14} />
    };
  };


  const canPay = (status) =>
    String(
      status || ''
    ).toUpperCase() ===
    'PENDING';


  const canViewPayment = (
    status
  ) => {
    const value =
      String(
        status || ''
      ).toUpperCase();

    return [
      'PAID',
      'PROCESSING',
      'SHIPPED',
      'DONE'
    ].includes(value);
  };


  // ========================================
  // FILTER
  // ========================================

  const filteredOrders =
    useMemo(() => {
      if (
        activeFilter === 'ALL'
      ) {
        return orders;
      }

      return orders.filter(
        (order) => {
          const status =
            String(
              order.status || ''
            ).toUpperCase();

          if (
            activeFilter ===
            'PROCESS'
          ) {
            return [
              'PAID',
              'PROCESSING'
            ].includes(status);
          }

          return (
            status ===
            activeFilter
          );
        }
      );
    }, [
      orders,
      activeFilter
    ]);


  const getFilterCount = (
    filter
  ) => {
    if (filter === 'ALL') {
      return orders.length;
    }

    if (filter === 'PROCESS') {
      return orders.filter(
        (order) =>
          [
            'PAID',
            'PROCESSING'
          ].includes(
            String(
              order.status || ''
            ).toUpperCase()
          )
      ).length;
    }

    return orders.filter(
      (order) =>
        String(
          order.status || ''
        ).toUpperCase() ===
        filter
    ).length;
  };


  // ========================================
  // PAYMENT
  // ========================================

  const openPaymentModal = (
    order
  ) => {
    setSelectedOrder(order);
    setSelectedMethod('QRIS');
    setCopied(false);
  };


  const closePaymentModal = () => {
    if (paymentLoading) {
      return;
    }

    setSelectedOrder(null);
    setSelectedMethod('QRIS');
    setCopied(false);
  };


  const getMethodInfo = (
    method
  ) => {
    if (
      method ===
      'BANK_TRANSFER'
    ) {
      return {
        title:
          'Transfer Bank',

        description:
          'Pembayaran melalui virtual account.',

        icon:
          <IconBuildingBank
            size={21}
          />,

        detailTitle:
          'Nomor Virtual Account',

        detailValue:
          '8808 1234 5678 9012'
      };
    }

    if (
      method ===
      'E_WALLET'
    ) {
      return {
        title:
          'E-Wallet',

        description:
          'Pembayaran menggunakan dompet digital.',

        icon:
          <IconDeviceMobile
            size={21}
          />,

        detailTitle:
          'Nomor E-Wallet',

        detailValue:
          '0812 3456 7890'
      };
    }

    return {
      title: 'QRIS',

      description:
        'Pembayaran cepat menggunakan QRIS.',

      icon:
        <IconQrcode
          size={21}
        />,

      detailTitle:
        'Pembayaran QRIS',

      detailValue:
        'SAYUR-DAY QRIS'
    };
  };


  const handlePay = async () => {
    if (!selectedOrder) {
      return;
    }

    try {
      setPaymentLoading(true);

      const response =
        await api.post(
          '/payments/pay',
          {
            order_id:
              selectedOrder.id,

            amount:
              Number(
                selectedOrder
                  .total_price
              ),

            method:
              selectedMethod
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const paymentData =
        response.data?.data;

      setOrders(
        (current) =>
          current.map(
            (order) =>
              order.id ===
              selectedOrder.id
                ? {
                    ...order,
                    status:
                      'PAID'
                  }
                : order
          )
      );

      const transactionCode =
        paymentData
          ?.transaction_code;

      showToast(
        transactionCode
          ? `Pembayaran berhasil. Kode transaksi: ${transactionCode}`
          : 'Pembayaran berhasil.'
      );

      setSelectedOrder(null);

      await fetchOrders();

    } catch (err) {
      console.error(
        'Pembayaran gagal:',
        err.response?.data || err
      );

      showToast(
        err.response?.data?.message ||
        'Pembayaran gagal diproses.',
        'error'
      );

    } finally {
      setPaymentLoading(false);
    }
  };


  // ========================================
  // PAYMENT RECEIPT
  // ========================================

  const fetchPaymentDetail =
    async (order) => {
      try {
        setPaymentDetailLoading(
          order.id
        );

        const response =
          await api.get(
            `/payments/order/${order.id}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        setPaymentDetail({
          order,
          payment:
            response.data?.data
        });

      } catch (err) {
        console.error(
          'Gagal mengambil pembayaran:',
          err.response?.data || err
        );

        showToast(
          err.response?.data
            ?.message ||
          'Detail pembayaran tidak dapat diambil.',
          'error'
        );

      } finally {
        setPaymentDetailLoading(
          null
        );
      }
    };


  // ========================================
  // COPY
  // ========================================

  const handleCopy = async () => {
    const info =
      getMethodInfo(
        selectedMethod
      );

    try {
      await navigator.clipboard
        .writeText(
          info.detailValue
        );

      setCopied(true);

      setTimeout(
        () =>
          setCopied(false),
        1500
      );

    } catch {
      showToast(
        'Gagal menyalin.',
        'error'
      );
    }
  };


  const methodInfo =
    getMethodInfo(
      selectedMethod
    );


  return (
    <div className="orders-page">
      <Navbar />


      {/* TOAST */}

      {toast.show && (
        <div
          className={
            toast.type === 'error'
              ? 'orders-toast orders-toast-error'
              : 'orders-toast'
          }
        >
          {toast.type ===
          'error' ? (
            <IconX size={19} />
          ) : (
            <IconCircleCheck
              size={19}
            />
          )}

          <span>
            {toast.message}
          </span>
        </div>
      )}


      <main className="orders-container">

        {/* HEADER */}

        <header className="orders-header">
          <div>
            <span className="orders-eyebrow">
              Riwayat Transaksi
            </span>

            <h1>
              Pesanan Saya
            </h1>

            <p>
              Pantau status
              pembayaran, pemrosesan,
              dan pengiriman pesananmu.
            </p>
          </div>

          <button
            type="button"
            className="orders-refresh"
            onClick={fetchOrders}
            disabled={loading}
          >
            <IconRefresh
              size={16}
              className={
                loading
                  ? 'orders-spin'
                  : ''
              }
            />

            Refresh
          </button>
        </header>


        {/* FILTER */}

        {!loading &&
          !error &&
          orders.length > 0 && (
            <div className="orders-filters">
              {FILTERS.map(
                (filter) => (
                  <button
                    type="button"
                    key={filter.value}
                    className={
                      activeFilter ===
                      filter.value
                        ? 'orders-filter active'
                        : 'orders-filter'
                    }
                    onClick={() =>
                      setActiveFilter(
                        filter.value
                      )
                    }
                  >
                    {filter.label}

                    <span>
                      {getFilterCount(
                        filter.value
                      )}
                    </span>
                  </button>
                )
              )}
            </div>
          )}


        {/* LOADING */}

        {loading && (
          <div className="orders-state">
            <IconLoader2
              size={30}
              className="orders-spin"
            />

            <strong>
              Mengambil pesanan...
            </strong>

            <span>
              Mohon tunggu sebentar.
            </span>
          </div>
        )}


        {/* ERROR */}

        {!loading &&
          error && (
            <div className="orders-error">
              <IconX size={21} />

              <div>
                <strong>
                  Pesanan tidak dapat
                  dimuat
                </strong>

                <span>
                  {error}
                </span>
              </div>
            </div>
          )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          orders.length === 0 && (
            <div className="orders-state">
              <div className="orders-empty-icon">
                <IconPackage
                  size={31}
                />
              </div>

              <strong>
                Belum ada pesanan
              </strong>

              <span>
                Pesanan yang kamu buat
                akan muncul di sini.
              </span>
            </div>
          )}


        {/* FILTER EMPTY */}

        {!loading &&
          !error &&
          orders.length > 0 &&
          filteredOrders.length ===
            0 && (
            <div className="orders-state">
              <IconPackage
                size={28}
              />

              <strong>
                Tidak ada pesanan
              </strong>

              <span>
                Tidak ada pesanan untuk
                kategori ini.
              </span>
            </div>
          )}


        {/* ORDERS */}

        {!loading &&
          !error &&
          filteredOrders.length > 0 && (
            <section className="orders-list">

              {filteredOrders.map(
                (order) => {
                  const status =
                    getStatus(
                      order.status
                    );

                  const payable =
                    canPay(
                      order.status
                    );

                  const viewPayment =
                    canViewPayment(
                      order.status
                    );

                  return (
                    <article
                      key={`order-${order.id}`}
                      className="orders-card"
                    >

                      {/* TOP */}

                      <div className="orders-card-top">

                        <div className="orders-number">
                          <span>
                            Pesanan
                          </span>

                          <strong>
                            #ORD-{order.id}
                          </strong>

                          <small>
                            {formatDate(
                              order.created_at
                            )}
                          </small>
                        </div>

                        <div
                          className={`orders-status ${status.className}`}
                        >
                          {status.icon}

                          {status.label}
                        </div>

                      </div>


                      {/* PRODUCTS */}

                      <div className="orders-products">

                        {Array.isArray(
                          order.items
                        ) &&
                        order.items.length >
                          0 ? (
                          order.items.map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                key={`order-${order.id}-item-${item.id || index}-${index}`}
                                className="orders-product"
                              >

                                <div className="orders-product-icon">
                                  <IconPackage
                                    size={20}
                                  />
                                </div>

                                <div className="orders-product-info">
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

                                <strong className="orders-product-total">
                                  Rp{' '}
                                  {formatRupiah(
                                    Number(
                                      item.price
                                    ) *
                                    Number(
                                      item.quantity
                                    )
                                  )}
                                </strong>

                              </div>
                            )
                          )
                        ) : (
                          <div className="orders-no-product">
                            Detail produk
                            tidak tersedia.
                          </div>
                        )}

                      </div>


                      {/* DELIVERY + TOTAL */}

                      <div className="orders-summary">

                        <div className="orders-address">
                          <IconMapPin
                            size={17}
                          />

                          <div>
                            <span>
                              Alamat
                              Pengiriman
                            </span>

                            <strong>
                              {order.delivery_address ||
                                '-'}
                            </strong>

                            {order.delivery_notes && (
                              <small>
                                Catatan:{' '}
                                {
                                  order.delivery_notes
                                }
                              </small>
                            )}
                          </div>
                        </div>

                        <div className="orders-total">
                          <span>
                            Total Pembayaran
                          </span>

                          <strong>
                            Rp{' '}
                            {formatRupiah(
                              order.total_price
                            )}
                          </strong>
                        </div>

                      </div>


                      {/* PENDING */}

                      {payable && (
                        <div className="orders-payment-callout">

                          <div>
                            <span className="orders-payment-icon">
                              <IconWallet
                                size={20}
                              />
                            </span>

                            <div>
                              <strong>
                                Pembayaran belum
                                selesai
                              </strong>

                              <p>
                                Bayar pesanan agar
                                dapat segera
                                diproses.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openPaymentModal(
                                order
                              )
                            }
                          >
                            <IconCreditCard
                              size={16}
                            />

                            Bayar Sekarang
                          </button>

                        </div>
                      )}


                      {/* PAYMENT RECEIPT */}

                      {viewPayment && (
                        <div className="orders-receipt-action">

                          <button
                            type="button"
                            onClick={() =>
                              fetchPaymentDetail(
                                order
                              )
                            }
                            disabled={
                              paymentDetailLoading ===
                              order.id
                            }
                          >
                            {paymentDetailLoading ===
                            order.id ? (
                              <>
                                <IconLoader2
                                  size={16}
                                  className="orders-spin"
                                />

                                Memuat...
                              </>
                            ) : (
                              <>
                                <IconReceipt
                                  size={16}
                                />

                                Lihat Detail
                                Pembayaran
                              </>
                            )}
                          </button>

                        </div>
                      )}

                    </article>
                  );
                }
              )}

            </section>
          )}

      </main>


      {/* ===================================
          PAYMENT MODAL
      =================================== */}

      {selectedOrder && (
        <div
          className="orders-modal-backdrop"
          onClick={
            closePaymentModal
          }
        >

          <div
            className="orders-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="orders-modal-header">
              <div>
                <span>
                  Pembayaran
                </span>

                <h2>
                  Pilih Metode Pembayaran
                </h2>

                <small>
                  #ORD-
                  {selectedOrder.id}
                </small>
              </div>

              <button
                type="button"
                className="orders-modal-close"
                onClick={
                  closePaymentModal
                }
                disabled={
                  paymentLoading
                }
              >
                <IconX size={18} />
              </button>
            </div>


            <div className="orders-modal-body">

              <div className="orders-modal-total">
                <span>
                  Total Tagihan
                </span>

                <strong>
                  Rp{' '}
                  {formatRupiah(
                    selectedOrder
                      .total_price
                  )}
                </strong>
              </div>


              <div className="orders-methods">

                <PaymentMethod
                  active={
                    selectedMethod ===
                    'QRIS'
                  }
                  icon={
                    <IconQrcode
                      size={21}
                    />
                  }
                  title="QRIS"
                  description="Scan QR untuk pembayaran cepat."
                  onClick={() =>
                    setSelectedMethod(
                      'QRIS'
                    )
                  }
                />

                <PaymentMethod
                  active={
                    selectedMethod ===
                    'BANK_TRANSFER'
                  }
                  icon={
                    <IconBuildingBank
                      size={21}
                    />
                  }
                  title="Transfer Bank"
                  description="Bayar melalui virtual account."
                  onClick={() =>
                    setSelectedMethod(
                      'BANK_TRANSFER'
                    )
                  }
                />

                <PaymentMethod
                  active={
                    selectedMethod ===
                    'E_WALLET'
                  }
                  icon={
                    <IconDeviceMobile
                      size={21}
                    />
                  }
                  title="E-Wallet"
                  description="Gunakan dompet digital pilihanmu."
                  onClick={() =>
                    setSelectedMethod(
                      'E_WALLET'
                    )
                  }
                />

              </div>


              {/* METHOD INFO */}

              <div className="orders-method-detail">
                <div>
                  <span>
                    {
                      methodInfo.detailTitle
                    }
                  </span>

                  <strong>
                    {
                      methodInfo.detailValue
                    }
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <IconCheck
                      size={16}
                    />
                  ) : (
                    <IconCopy
                      size={16}
                    />
                  )}
                </button>
              </div>


              <div className="orders-payment-security">
                <IconShieldCheck
                  size={19}
                />

                <p>
                  Pembayaran akan
                  diproses melalui
                  payment-service.
                  Setelah berhasil,
                  status pesanan berubah
                  menjadi Sudah Dibayar.
                </p>
              </div>


              <button
                type="button"
                className="orders-pay-button"
                onClick={handlePay}
                disabled={
                  paymentLoading
                }
              >
                {paymentLoading ? (
                  <>
                    <IconLoader2
                      size={18}
                      className="orders-spin"
                    />

                    Memproses
                    Pembayaran...
                  </>
                ) : (
                  <>
                    <IconCreditCard
                      size={18}
                    />

                    Bayar Rp{' '}
                    {formatRupiah(
                      selectedOrder
                        .total_price
                    )}
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      )}


      {/* ===================================
          RECEIPT
      =================================== */}

      {paymentDetail && (
        <div
          className="orders-modal-backdrop"
          onClick={() =>
            setPaymentDetail(null)
          }
        >

          <div
            className="orders-receipt-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="orders-modal-close orders-receipt-close"
              onClick={() =>
                setPaymentDetail(null)
              }
            >
              <IconX size={18} />
            </button>


            <div className="orders-receipt-success">
              <div>
                <IconCircleCheck
                  size={39}
                />
              </div>

              <h2>
                Pembayaran Berhasil
              </h2>

              <p>
                Transaksi sudah tercatat
                di payment-service.
              </p>
            </div>


            <div className="orders-receipt-table">

              <ReceiptRow
                label="Order"
                value={`#ORD-${paymentDetail.order?.id}`}
              />

              <ReceiptRow
                label="Kode Transaksi"
                value={
                  paymentDetail.payment
                    ?.transaction_code ||
                  '-'
                }
              />

              <ReceiptRow
                label="Metode"
                value={
                  paymentDetail.payment
                    ?.method || '-'
                }
              />

              <ReceiptRow
                label="Status"
                value={
                  paymentDetail.payment
                    ?.status || '-'
                }
              />

              <ReceiptRow
                label="Total"
                value={`Rp ${formatRupiah(
                  paymentDetail.payment
                    ?.amount
                )}`}
              />

              <ReceiptRow
                label="Tanggal"
                value={
                  formatDateTime(
                    paymentDetail.payment
                      ?.created_at
                  )
                }
                last
              />

            </div>

          </div>
        </div>
      )}

    </div>
  );
}


// ========================================
// PAYMENT METHOD
// ========================================

function PaymentMethod({
  active,
  icon,
  title,
  description,
  onClick
}) {
  return (
    <button
      type="button"
      className={
        active
          ? 'orders-method active'
          : 'orders-method'
      }
      onClick={onClick}
    >
      <span className="orders-method-icon">
        {icon}
      </span>

      <span className="orders-method-text">
        <strong>
          {title}
        </strong>

        <small>
          {description}
        </small>
      </span>

      <span className="orders-radio" />
    </button>
  );
}


// ========================================
// RECEIPT ROW
// ========================================

function ReceiptRow({
  label,
  value,
  last = false
}) {
  return (
    <div
      className={
        last
          ? 'orders-receipt-row last'
          : 'orders-receipt-row'
      }
    >
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}