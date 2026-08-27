import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

const getProductId = (product) => {
  if (!product) return null;

  const candidates = [
    product.product_id,
    product.productId,
    product.id,
    product.ID,
    product.ProductID,
    product.ProductId,
  ];

  const rawId = candidates.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ''
  );

  if (rawId === undefined) {
    return null;
  }

  const numericId = Number(rawId);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  return numericId;
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('sayur_cart');

      if (!localData) {
        return [];
      }

      const parsed = JSON.parse(localData);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed;
    } catch (error) {
      console.error('Gagal membaca cart:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      'sayur_cart',
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  const addToCart = (product) => {
    if (!product) return;

    const productId = getProductId(product);

    if (!productId) {
      console.error(
        'Produk tidak memiliki ID database yang valid:',
        product
      );

      toast.error('Produk gagal ditambahkan ke keranjang');

      return;
    }

    const productName =
      product.name ||
      product.title ||
      product.nama ||
      'Produk';

    const productPrice = Number(
      product.price ??
      product.harga ??
      0
    );

    const productImage =
      product.image ||
      product.img ||
      product.image_url ||
      product.photo ||
      '';

    const productUnit =
      product.unit ||
      product.satuan ||
      'kg';

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          Number(
            item.product_id ??
            item.id
          ) === productId
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];

        updated[existingIndex] = {
          ...updated[existingIndex],

          id: productId,
          product_id: productId,

          quantity:
            Number(
              updated[existingIndex].quantity || 1
            ) + 1,
        };

        return updated;
      }

      return [
        ...prevItems,
        {
          id: productId,
          product_id: productId,

          name: productName,

          price: productPrice,

          quantity: 1,

          image: productImage,

          unit: productUnit,
        },
      ];
    });

    toast.custom(
      (t) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            width: '360px',
            background: '#ffffff',
            padding: '14px 16px',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 14px 35px rgba(33, 49, 60, 0.16)',
            borderLeft: '5px solid var(--brand-green)',
            transform: t.visible
              ? 'translateY(0)'
              : 'translateY(-10px)',
            opacity: t.visible ? 1 : 0,
            transition: 'all 0.25s ease',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: '#eafbea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: '22px',
              }}
            >
              🛒
            </span>
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#21313c',
                marginBottom: '3px',
              }}
            >
              Masuk ke keranjang!
            </div>

            <div
              style={{
                fontSize: '13px',
                color: '#6b7280',
              }}
            >
              <span
                style={{
                  fontWeight: '600',
                  color: '#21313c',
                }}
              >
                {productName}
              </span>{' '}
              berhasil ditambahkan
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id);
              window.location.href = '/cart';
            }}
            style={{
              border: 'none',
              background: 'var(--brand-green)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '700',
              padding: '8px 10px',
              borderRadius: '9px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Lihat
          </button>
        </div>
      ),
      {
        duration: 3000,
      }
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => {
        const itemId =
          item.product_id ??
          item.id;

        return String(itemId) !== String(id);
      })
    );
  };

  const updateQuantity = (id, amount) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          const itemId =
            item.product_id ??
            item.id;

          if (String(itemId) === String(id)) {
            const newQuantity =
              Number(item.quantity || 1) +
              Number(amount);

            if (newQuantity <= 0) {
              return null;
            }

            return {
              ...item,
              quantity: newQuantity,
            };
          }

          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('sayur_cart');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  return useContext(CartContext);
};
