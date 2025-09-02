import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingCart } from "lucide-react";
import Link from "next/link";

type CartItem = { id: string; event?: any; spaces: number };

type CartContextType = {
  items: CartItem[];
  cartCount: number;
  refreshCart: () => void;
  handleRemoveCartItem: (cartItemId: string) => Promise<void>;
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

  // Entfernen-Funktion
  const handleRemoveCartItem = async (cartItemId: string) => {
    const res = await fetch(`/api/cart/item/remove`, {
      method: "POST",
      body: JSON.stringify({ cartItemId }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      setItems(items.filter(item => item.id !== cartItemId));
      fetchCart();
    }
  };

  return (
    <CartContext.Provider value={{ items, cartCount, refreshCart: fetchCart, handleRemoveCartItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}

export function MiniCart({ message }: { message?: string }) {
  const { items, handleRemoveCartItem } = useCart();
  const router = useRouter();

  // Meldung für Entfernen
  const [removeMsg, setRemoveMsg] = useState<string | null>(null);

  // Meldung nach 3 Sekunden ausblenden
  useEffect(() => {
    if (removeMsg) {
      const timer = setTimeout(() => setRemoveMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [removeMsg]);

  // Gesamtbetrag berechnen
  const total = items.reduce(
    (sum, item) =>
      sum + (item.event?.price && !item.event?.chargeFree ? item.event.price * item.spaces : 0),
    0
  );

  return (
    <div className="bg-white p-6 rounded-xl h-full flex flex-col align-end justify-start">
      {/* Erfolgsmeldung beim Hinzufügen */}
      {message && (
        <div className="mb-2 px-3 py-2 rounded bg-green-100 text-green-800 font-semibold text-center shadow">
          {message}
        </div>
      )}
      {/* Meldung beim Entfernen */}
      {removeMsg && (
        <div className="mb-2 px-3 py-2 rounded bg-red-100 text-red-800 font-semibold text-center shadow">
          {removeMsg}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Warenkorb</h3>
        <ShoppingCart className="h-6 w-6 text-[#e60000]" />
      </div>
      {items.length === 0 ? (
        <div className="text-gray-600 mb-6">Keine Artikel im Warenkorb.</div>
      ) : (
        <>
          <ul className="mb-6 space-y-4">
            {items.map(item => (
              <li key={item.id} className="flex justify-between items-center">
                <span>
                  <Link
                    href={`/events/${item.event?.id}`}
                    className="text-gray-900 font-bold"
                  >
                    {item.event?.title}
                  </Link>
                </span>
                <span>
                  {item.spaces} ×{" "}
                  {item.event?.price && !item.event?.chargeFree
                    ? `${item.event.price} €`
                    : "Kostenfrei"}
                </span>
                <button
                  className="ml-4 bg-[#e60000] text-white px-2 py-1 rounded hover:bg-red-700 flex items-center justify-center cursor-pointer"
                  title="Entfernen"
                  onClick={async () => {
                    await handleRemoveCartItem(item.id);
                    setRemoveMsg("Event wurde aus dem Warenkorb entfernt!");
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
          <div className="mb-6 text-right font-bold text-lg">
            Gesamt: {`${total.toFixed(2)} €`}
          </div>
        </>
      )}
      <button
        className="bg-[#e60000] text-xl text-white px-4 py-2 rounded-xl font-medium hover:bg-red-700 transition-all self-end cursor-pointer"
        onClick={() => router.push("/checkout")}
      >
        Zur Kasse
      </button>
    </div>
  );
}