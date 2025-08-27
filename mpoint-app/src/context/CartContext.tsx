import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export function MiniCart({ show, onClose, message }: { show: boolean; onClose: () => void; message?: string }) {
  const { items } = useCart();
  const router = useRouter();

  if (!show) return null;

  return (
    <div className="fixed top-24 right-8 w-80 bg-white rounded-xl shadow-lg border z-50 p-6">
      {message && (
        <div className="mb-4 px-3 py-2 rounded bg-green-100 text-green-800 font-semibold text-center shadow">
          {message}
        </div>
      )}
      <h2 className="text-lg font-bold mb-4">Mini-Warenkorb</h2>
      {items.length === 0 ? (
        <div className="text-gray-500">Keine Artikel im Warenkorb.</div>
      ) : (
        <ul className="mb-4">
          {items.map(item => (
            <li key={item.id} className="mb-2 flex justify-between">
              <span>{item.event?.title}</span>
              <span>{item.spaces} × {item.event?.price ? `${item.event.price} €` : "Kostenfrei"}</span>
            </li>
          ))}
        </ul>
      )}
      <button
        className="bg-[#e60000] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#c01a1f] transition-colors w-full"
        onClick={() => router.push("/cart")}
      >
        Zum Warenkorb
      </button>
      <button
        className="mt-2 text-sm text-gray-500 hover:underline w-full"
        onClick={onClose}
      >
        Schließen
      </button>
    </div>
  );
}