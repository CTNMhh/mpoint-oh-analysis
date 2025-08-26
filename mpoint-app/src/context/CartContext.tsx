import React, { createContext, useContext, useEffect, useState } from "react";

type CartItem = { /* ... */ };

type CartContextType = {
  items: CartItem[];
  cartCount: number;
  refreshCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = async () => {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const data = await res.json();
      setItems(data.cart.items || []);
      setCartCount(data.count ?? (data.cart.items?.length ?? 0));
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ items, cartCount, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}