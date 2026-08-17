import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

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