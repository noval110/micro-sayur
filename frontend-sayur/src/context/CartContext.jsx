import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('sayur_cart');
      return localData ? JSON.parse(localData) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sayur_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    if (!product) return;

    const rawName = String(product.name || product.title || 'produk').trim().toLowerCase();
    const uniqueKey = `CART-${rawName.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => {
        const itemName = String(item.name || '').trim().toLowerCase();
        return itemName === rawName;
      });

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 1) + 1
        };
        return updated;
      }

      return [
        ...prevItems,
        {
          id: product.id && product.id !== 1 ? product.id : uniqueKey,
          name: product.name || product.title || 'Produk',
          price: Number(product.price || product.harga || 0),
          quantity: 1,
          image: product.image || product.img || '',
          unit: product.unit || 'kg'
        }
      ];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  const updateQuantity = (id, amount) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (String(item.id) === String(id)) {
            const newQty = (item.quantity || 1) + amount;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
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
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);