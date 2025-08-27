import React, { createContext, useContext, useEffect, useState, useRef } from "react";
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
  const cartRef = useRef<HTMLDivElement>(null);

  // Click-Outside-Handler
  useEffect(() => {
    if (!show) return;
    function handleClick(e: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [show, onClose]);

  if (!show) return null;

  // Gesamtbetrag berechnen
  const total = items.reduce(
    (sum, item) =>
      sum + (item.event?.price && !item.event?.chargeFree ? item.event.price * item.spaces : 0),
    0
  );

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black z-40"
        style={{ opacity: 0.50 }}
        onClick={onClose}
      />

      {/* MiniCart */}
      <div
        ref={cartRef}
        className="fixed top-24 right-8 w-80 bg-white shadow-lg border z-50 p-6 rounded-md"
      >
        {message && (
          <div className="mb-4 px-3 py-2 rounded bg-green-100 text-green-800 font-semibold text-center shadow">
            {message}
          </div>
        )}
        <h2 className="text-lg font-bold mb-4">Warenkorb</h2>
        {items.length === 0 ? (
          <div className="text-gray-500">Keine Artikel im Warenkorb.</div>
        ) : (
          <>
            <ul className="mb-6 space-y-4">
              {items.map(item => (
                <li key={item.id} className="flex justify-between items-center">
                  <span>{item.event?.title}</span>
                  <span>
                    {item.spaces} ×{" "}
                    {item.event?.price && !item.event?.chargeFree
                      ? `${item.event.price} €`
                      : "Kostenfrei"}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mb-6 text-right font-bold text-lg">
              Gesamt: {`${total.toFixed(2)} €`}
            </div>
          </>
        )}
        <button
          className="bg-[#e60000] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#c01a1f] transition-colors w-full"
          onClick={() => router.push("/cart")}
        >
          Zum Warenkorb
        </button>
        <button
          className="bg-sky-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-sky-500 transition-colors w-full mt-2"
          onClick={onClose}
        >
          Schließen
        </button>
      </div>
    </>
  );
}