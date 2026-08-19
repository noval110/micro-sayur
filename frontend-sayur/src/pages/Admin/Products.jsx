import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import api from '../../api';

import {
  IconAlertCircle,
  IconCheck,
  IconEdit,
  IconLoader2,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTags,
  IconTrash,
  IconX
} from '@tabler/icons-react';

import './Products.css';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80';

const DEFAULT_CATEGORY = 'Sayur Daun';

export default function Products() {
  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState('');

  const [toast, setToast] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [formMode, setFormMode] =
    useState('create');

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [deleteProduct, setDeleteProduct] =
    useState(null);

  const [search, setSearch] =
    useState('');

  const [
    categoryFilter,
    setCategoryFilter
  ] = useState('ALL');
const [name, setName] =
    useState('');

  const [price, setPrice] =
    useState('');

  const [stock, setStock] =
    useState('');

  const [
    category,
    setCategory
  ] = useState(DEFAULT_CATEGORY);

  const [unit, setUnit] =
    useState('kg');

  const [
    imageFile,
    setImageFile
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview
  ] = useState('');

  const [
    existingImage,
    setExistingImage
  ] = useState('');
const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await api.get('/products');

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.data;

      setProducts(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        'Gagal mengambil produk:',
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          'Produk gagal dimuat.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);
useEffect(() => {
    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith('blob:')
      ) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);
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
const resetForm = () => {
    if (
      imagePreview &&
      imagePreview.startsWith('blob:')
    ) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setName('');
    setPrice('');
    setStock('');
    setCategory(
      DEFAULT_CATEGORY
    );
    setUnit('kg');
    setImageFile(null);
    setImagePreview('');
    setExistingImage('');
    setEditingProduct(null);
    setFormMode('create');
  };
const handleImageChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      event.target.value = '';

      showToast(
        'Gunakan gambar JPG, PNG, atau WEBP.',
        'error'
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      event.target.value = '';

      showToast(
        'Ukuran gambar maksimal 5 MB.',
        'error'
      );

      return;
    }

    if (
      imagePreview &&
      imagePreview.startsWith('blob:')
    ) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    const preview =
      URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(preview);
  };
const openCreateForm = () => {
    resetForm();

    setFormMode('create');

    setShowForm(true);
  };
const openEditForm = (
    product
  ) => {
    resetForm();

    setFormMode('edit');

    setEditingProduct(
      product
    );

    setName(
      product.name || ''
    );

    setPrice(
      String(
        product.price ?? ''
      )
    );

    setStock(
      String(
        product.stock ?? ''
      )
    );

    setCategory(
      product.category ||
        DEFAULT_CATEGORY
    );

    setUnit(
      product.unit || 'kg'
    );

    setExistingImage(
      product.image || ''
    );

    setImagePreview(
      product.image || ''
    );

    setShowForm(true);
  };
const closeForm = () => {
    if (submitting) {
      return;
    }

    resetForm();

    setShowForm(false);
  };
const uploadImage = async () => {
    if (!imageFile) {
      return existingImage;
    }

    const formData =
      new FormData();

    formData.append(
      'image',
      imageFile
    );

    const uploadResponse =
      await api.post(
        '/products/upload-image',
        formData
      );

    const imageURL =
      uploadResponse.data?.data?.url;

    if (!imageURL) {
      throw new Error(
        'URL gambar tidak diterima dari server.'
      );
    }

    return imageURL;
  };
const getFormPayload = async () => {
    const cleanName =
      name.trim();

    const cleanCategory =
      category.trim();

    const cleanUnit =
      unit.trim();

    const productPrice =
      Number(price);

    const productStock =
      Number(stock);

    if (!cleanName) {
      throw new Error(
        'Nama produk wajib diisi.'
      );
    }

    if (
      !Number.isFinite(
        productPrice
      ) ||
      productPrice <= 0
    ) {
      throw new Error(
        'Harga produk harus lebih dari 0.'
      );
    }

    if (
      !Number.isInteger(
        productStock
      ) ||
      productStock < 0
    ) {
      throw new Error(
        'Stok produk tidak valid.'
      );
    }

    if (!cleanCategory) {
      throw new Error(
        'Kategori wajib diisi.'
      );
    }

    if (!cleanUnit) {
      throw new Error(
        'Satuan wajib diisi.'
      );
    }

    if (
      formMode === 'create' &&
      !imageFile
    ) {
      throw new Error(
        'Gambar produk wajib dipilih.'
      );
    }

    const imageURL =
      await uploadImage();

    return {
      name:
        cleanName,

      category:
        cleanCategory,

      price:
        productPrice,

      stock:
        productStock,

      unit:
        cleanUnit,

      image:
        imageURL || ''
    };
  };
const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSubmitting(true);

      const payload =
        await getFormPayload();

      if (
        formMode === 'edit' &&
        editingProduct
      ) {
        await api.patch(
          `/products/${editingProduct.id}`,
          payload
        );

        showToast(
          'Produk berhasil diperbarui.'
        );
      } else {
        await api.post(
          '/products',
          payload
        );

        showToast(
          'Produk berhasil ditambahkan.'
        );
      }

      resetForm();

      setShowForm(false);

      await loadProducts();
    } catch (err) {
      console.error(
        'Gagal menyimpan produk:',
        err.response?.data || err
      );

      showToast(
        err.response?.data?.message ||
          err.message ||
          'Gagal menyimpan produk.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };
const openDeleteModal = (
    product
  ) => {
    setDeleteProduct(
      product
    );
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setDeleteProduct(null);
  };

  const handleDelete = async () => {
    if (!deleteProduct) {
      return;
    }

    try {
      setDeleting(true);

      await api.delete(
        `/products/${deleteProduct.id}`
      );

      showToast(
        'Produk berhasil dihapus.'
      );

      setDeleteProduct(null);

      await loadProducts();
    } catch (err) {
      console.error(
        'Gagal menghapus produk:',
        err.response?.data || err
      );

      showToast(
        err.response?.data?.message ||
          'Gagal menghapus produk.',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };
const categories =
    useMemo(() => {
      const values =
        products
          .map(
            (product) =>
              product.category
          )
          .filter(Boolean);

      return [
        ...new Set(values)
      ].sort();
    }, [products]);
const filteredProducts =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const nameMatch =
            String(
              product.name || ''
            )
              .toLowerCase()
              .includes(keyword);

          const categoryMatch =
            categoryFilter ===
              'ALL' ||
            String(
              product.category || ''
            ) ===
              categoryFilter;

          return (
            nameMatch &&
            categoryMatch
          );
        }
      );
    }, [
      products,
      search,
      categoryFilter
    ]);
const stats =
    useMemo(() => {
      const totalProducts =
        products.length;

      const totalStock =
        products.reduce(
          (
            total,
            product
          ) =>
            total +
            Number(
              product.stock || 0
            ),
          0
        );

      const lowStock =
        products.filter(
          (product) => {
            const stockValue =
              Number(
                product.stock || 0
              );

            return (
              stockValue > 0 &&
              stockValue <= 10
            );
          }
        ).length;

      const outOfStock =
        products.filter(
          (product) =>
            Number(
              product.stock || 0
            ) <= 0
        ).length;

      return {
        totalProducts,
        totalStock,
        lowStock,
        outOfStock
      };
    }, [products]);
const getStockBadge = (
    value
  ) => {
    const amount =
      Number(value || 0);

    if (amount <= 0) {
      return {
        label:
          'Stok Habis',

        className:
          'products-stock-empty'
      };
    }

    if (amount <= 10) {
      return {
        label:
          `${amount} tersisa`,

        className:
          'products-stock-low'
      };
    }

    return {
      label:
        `${amount} tersedia`,

      className:
        'products-stock-good'
    };
  };

  return (
    <div className="products-page">
{toast && (
        <div
          className={
            toast.type ===
            'error'
              ? 'products-toast products-toast-error'
              : 'products-toast'
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
<header className="products-header">

        <div>
          <span className="products-eyebrow">
            Inventory
          </span>

          <h1>
            Kelola Produk
          </h1>

          <p>
            Tambah dan pantau
            inventaris produk
            Sayur-day.
          </p>
        </div>

        <div className="products-header-actions">

          <button
            type="button"
            className="products-refresh"
            onClick={
              loadProducts
            }
            disabled={loading}
          >
            <IconRefresh
              size={16}
              className={
                loading
                  ? 'products-spin'
                  : ''
              }
            />

            Refresh
          </button>

          <button
            type="button"
            className="products-add-button"
            onClick={
              openCreateForm
            }
          >
            <IconPlus
              size={17}
            />

            Tambah Produk
          </button>

        </div>

      </header>
{error && (
        <div className="products-error">
          <IconAlertCircle
            size={19}
          />

          <div>
            <strong>
              Gagal memuat produk
            </strong>

            <span>
              {error}
            </span>
          </div>
        </div>
      )}
<section className="products-stats">

        <ProductStat
          title="Total Produk"
          value={
            stats.totalProducts
          }
          icon={
            <IconPackage
              size={21}
            />
          }
          type="green"
        />

        <ProductStat
          title="Total Stok"
          value={
            stats.totalStock
          }
          icon={
            <IconTags
              size={21}
            />
          }
          type="blue"
        />

        <ProductStat
          title="Stok Menipis"
          value={
            stats.lowStock
          }
          icon={
            <IconAlertCircle
              size={21}
            />
          }
          type="orange"
        />

        <ProductStat
          title="Stok Habis"
          value={
            stats.outOfStock
          }
          icon={
            <IconX
              size={21}
            />
          }
          type="red"
        />

      </section>
<section className="products-card">

        <div className="products-card-header">

          <div>
            <h2>
              Daftar Produk
            </h2>

            <p>
              {filteredProducts.length}{' '}
              dari {products.length}{' '}
              produk.
            </p>
          </div>

          <div className="products-tools">

            <div className="products-search">
              <IconSearch
                size={16}
              />

              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />
            </div>

            <select
              className="products-filter"
              value={
                categoryFilter
              }
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
            >
              <option value="ALL">
                Semua Kategori
              </option>

              {categories.map(
                (item) => (
                  <option
                    value={item}
                    key={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

          </div>

        </div>

        {loading ? (
          <div className="products-state">
            <IconLoader2
              size={29}
              className="products-spin"
            />

            <strong>
              Memuat produk...
            </strong>

            <span>
              Mengambil data dari
              product-service.
            </span>
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="products-state">
            <IconPackage
              size={31}
            />

            <strong>
              Produk tidak ditemukan
            </strong>

            <span>
              Tidak ada produk yang
              sesuai pencarian.
            </span>
          </div>
        ) : (
          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Stok</th>
                  <th>ID</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(
                  (product) => {
                    const stock =
                      getStockBadge(
                        product.stock
                      );

                    return (
                      <tr
                        key={
                          product.id
                        }
                      >

                        <td>
                          <div className="products-product-cell">

                            <img
                              src={
                                product.image ||
                                FALLBACK_IMG
                              }
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

                            <div>
                              <strong>
                                {
                                  product.name
                                }
                              </strong>

                              <span>
                                per{' '}
                                {product.unit ||
                                  'kg'}
                              </span>
                            </div>

                          </div>
                        </td>

                        <td>
                          <span className="products-category">
                            {product.category ||
                              '-'}
                          </span>
                        </td>

                        <td>
                          <strong className="products-price">
                            Rp{' '}
                            {Number(
                              product.price ||
                                0
                            ).toLocaleString(
                              'id-ID'
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`products-stock ${stock.className}`}
                          >
                            {
                              stock.label
                            }
                          </span>
                        </td>

                        <td>
                          <span className="products-id">
                            #{product.id}
                          </span>
                        </td>

                        <td>
                          <div className="products-actions">

                            <button
                              type="button"
                              className="products-edit-button"
                              onClick={() =>
                                openEditForm(
                                  product
                                )
                              }
                              title="Edit produk"
                            >
                              <IconEdit
                                size={15}
                              />
                            </button>

                            <button
                              type="button"
                              className="products-delete-button"
                              onClick={() =>
                                openDeleteModal(
                                  product
                                )
                              }
                              title="Hapus produk"
                            >
                              <IconTrash
                                size={15}
                              />
                            </button>

                          </div>
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
{showForm && (
        <div
          className="products-modal-backdrop"
          onClick={
            closeForm
          }
        >

          <div
            className="products-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="products-modal-header">

              <div>
                <span>
                  {formMode ===
                  'edit'
                    ? 'Edit Produk'
                    : 'Produk Baru'}
                </span>

                <h2>
                  {formMode ===
                  'edit'
                    ? `Edit ${editingProduct?.name || 'Produk'}`
                    : 'Tambah Produk'}
                </h2>

                <p>
                  {formMode ===
                  'edit'
                    ? 'Perubahan akan langsung disimpan ke product-service.'
                    : 'Produk akan langsung disimpan ke product-service.'}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeForm
                }
                disabled={
                  submitting
                }
                className="products-modal-close"
              >
                <IconX
                  size={18}
                />
              </button>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="products-form"
            >

              <div className="products-form-grid">

                <div className="products-field products-field-full">
                  <label>
                    Nama Produk *
                  </label>

                  <input
                    type="text"
                    placeholder="Contoh: Wortel Brastagi"
                    value={name}
                    disabled={
                      submitting
                    }
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="products-field">
                  <label>
                    Harga (Rp) *
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="15000"
                    value={price}
                    disabled={
                      submitting
                    }
                    onChange={(e) =>
                      setPrice(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="products-field">
                  <label>
                    Stok *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="40"
                    value={stock}
                    disabled={
                      submitting
                    }
                    onChange={(e) =>
                      setStock(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="products-field">
                  <label>
                    Kategori *
                  </label>

                  <select
                    value={category}
                    disabled={
                      submitting
                    }
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
                  >
                    <option value="Buah">
                      Buah
                    </option>

                    <option value="Sayur Daun">
                      Sayur Daun
                    </option>

                    <option value="Umbi">
                      Umbi
                    </option>

                    <option value="Buah Sayur">
                      Buah Sayur
                    </option>

                    <option value="Sayur">
                      Sayur
                    </option>

                    <option value="Bumbu">
                      Bumbu
                    </option>
                  </select>
                </div>

                <div className="products-field">
                  <label>
                    Satuan *
                  </label>

                  <input
                    type="text"
                    placeholder="kg, ikat, pack..."
                    value={unit}
                    disabled={
                      submitting
                    }
                    onChange={(e) =>
                      setUnit(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="products-field products-field-full">
                  <label>
                    Gambar Produk{' '}
                    {formMode ===
                    'create'
                      ? '*'
                      : ''}
                  </label>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={
                      submitting
                    }
                    onChange={
                      handleImageChange
                    }
                  />

                  <small>
                    JPG, PNG atau WEBP.
                    Maksimal 5 MB.
                    {formMode ===
                    'edit'
                      ? ' Kosongkan jika tidak ingin mengganti gambar.'
                      : ''}
                  </small>
                </div>

              </div>

              {imagePreview && (
                <div className="products-preview">

                  <span>
                    Preview Gambar
                  </span>

                  <img
                    src={
                      imagePreview
                    }
                    alt="Preview produk"
                  />

                </div>
              )}

              <div className="products-form-actions">

                <button
                  type="button"
                  className="products-cancel"
                  onClick={
                    closeForm
                  }
                  disabled={
                    submitting
                  }
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="products-submit"
                  disabled={
                    submitting
                  }
                >
                  {submitting ? (
                    <>
                      <IconLoader2
                        size={17}
                        className="products-spin"
                      />

                      Menyimpan...
                    </>
                  ) : formMode ===
                    'edit' ? (
                    <>
                      <IconCheck
                        size={17}
                      />

                      Simpan Perubahan
                    </>
                  ) : (
                    <>
                      <IconPlus
                        size={17}
                      />

                      Tambah Produk
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
{deleteProduct && (
        <div
          className="products-modal-backdrop"
          onClick={
            closeDeleteModal
          }
        >
          <div
            className="products-delete-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="products-delete-icon">
              <IconTrash
                size={28}
              />
            </div>

            <h2>
              Hapus Produk?
            </h2>

            <p>
              Produk{' '}
              <strong>
                {deleteProduct.name}
              </strong>{' '}
              akan dihapus dari
              product-service.
            </p>

            <div className="products-delete-actions">

              <button
                type="button"
                className="products-cancel"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  deleting
                }
              >
                Batal
              </button>

              <button
                type="button"
                className="products-delete-confirm"
                onClick={
                  handleDelete
                }
                disabled={
                  deleting
                }
              >
                {deleting ? (
                  <>
                    <IconLoader2
                      size={17}
                      className="products-spin"
                    />

                    Menghapus...
                  </>
                ) : (
                  <>
                    <IconTrash
                      size={17}
                    />

                    Ya, Hapus
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
function ProductStat({
  title,
  value,
  icon,
  type
}) {
  return (
    <article className="products-stat-card">

      <span
        className={`products-stat-icon ${type}`}
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