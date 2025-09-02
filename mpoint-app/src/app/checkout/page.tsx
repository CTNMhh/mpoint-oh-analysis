"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Trash2 } from "lucide-react";

export default function CheckoutPage() {
  const [cart, setCart] = useState<{ id: string, items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1); // Nur noch 1 und 2
  const [form, setForm] = useState({
    paymentMethod: "",
    name: "",
    email: "",
    street: "",
    zipCode: "",
    city: "",
    country: "Deutschland",
  });
  const [error, setError] = useState("");
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { refreshCart } = useCart();

  useEffect(() => {
    async function fetchCartAndUser() {
      setLoading(true);
      const [cartRes, userRes, companyRes] = await Promise.all([
        fetch("/api/cart"),
        fetch("/api/user"),
        fetch("/api/company"),
      ]);
      const cartData = cartRes.ok ? await cartRes.json() : {};
      const userData = userRes.ok ? await userRes.json() : {};
      const companyData = companyRes.ok ? await companyRes.json() : {};

      setCart(cartData.cart);

      // Prüfe, ob die Userdaten wirklich vorhanden sind
      const firstName = userData?.firstName || "";
      const lastName = userData?.lastName || "";
      const email = userData?.email || "";

      setForm((prev) => ({
        ...prev,
        name: `${firstName} ${lastName}`.trim(),
        email: email,
        street: companyData?.street || "",
        zipCode: companyData?.zipCode || "",
        city: companyData?.district || "",
        country: companyData?.country || "Deutschland",
      }));

      setLoading(false);
    }
    fetchCartAndUser();
  }, []);

  useEffect(() => {
    if (!window.paypal) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=EUR`;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (
      form.paymentMethod === "PAYPAL" &&
      typeof window !== "undefined" &&
      window.paypal &&
      document.getElementById("paypal-button-container")
    ) {
      window.paypal.Buttons({
        createOrder: async () => {
          // Hole die PayPal-Order-ID vom Backend
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentMethod: "PAYPAL", address: form }),
          });
          const data = await res.json();
          return data.paypalOrderId; // Muss vom Backend geliefert werden!
        },
        onApprove: async (data: any) => {
          const res = await fetch("/api/paypal/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderID }),
          });
          const result = await res.json();
          if (result.success) {
            setStep(2); // Danke-Seite anzeigen
          } else {
            setError("PayPal-Zahlung fehlgeschlagen.");
          }
        }
      }).render("#paypal-button-container");
    }
  }, [form.paymentMethod, step, form]);

  async function handleRemoveCartItem(cartItemId: string) {
    if (!cart) return;
    const res = await fetch(`/api/cart/item/remove`, {
      method: "POST",
      body: JSON.stringify({ cartItemId }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      setCart({
        ...cart,
        items: cart.items.filter(item => item.id !== cartItemId),
      });
      refreshCart();
      setMessage({ type: "success", text: "Event wurde aus dem Warenkorb entfernt." });
    } else {
      setMessage({ type: "error", text: "Fehler beim Entfernen aus dem Warenkorb." });
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e60000] mx-auto mb-4"></div>
          <p className="text-gray-600">Lädt Checkout...</p>
        </div>
      </main>
    );
  }

  // Meldungs-Block immer vor dem eigentlichen Content!
  const messageBlock = message && (
    <div className={`mb-6 px-4 py-3 rounded-lg font-semibold text-center shadow ${
      message.type === "success"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
    } mt-20`}>
      {message.text}
    </div>
  );

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        {messageBlock}
        <div className="mt-20 py-8 text-gray-500 text-center">
          Es sind keine Event-Buchungen im Warenkorb vorhanden
        </div>
      </main>
    );
  }

  // Nach dem Gesamtbetrag im JSX:
  const total = cart.items.reduce((sum, item) => sum + ((item.event?.price || 0) * item.spaces), 0);
  const mwst = total * 0.19;

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12">
      {messageBlock}
      <div className="max-w-3xl mx-auto py-8">
        <div id="cart-box">
          <h1 className="text-2xl font-bold mb-6">Kasse</h1>
          <table id="cart-items" className="w-full border rounded-xl overflow-hidden shadow bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase leading-tight">
                <th className="py-2 px-2 text-left">Event</th>
                <th className="py-2 px-2 text-center">Plätze</th>
                <th className="py-2 px-2 text-right">Gesamt</th>
                <th className="py-2 px-2 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.id}>
                  <td id="cart-item-title" className="py-2 px-2 border-b max-w-[120px]">{item.event?.title}</td>
                  <td id="cart-item-spaces" className="py-2 px-2 border-b text-center">{item.spaces}</td>
                  <td id="cart-item-total" className="py-2 px-2 border-b text-right">{item.event?.price ? (item.event.price * item.spaces).toFixed(2) + " €" : "Kostenfrei"}</td>
                  <td id="cart-item-actions" className="py-2 px-2 border-b text-center align-middle">
                    <button
                      id="cart-item-remove-button"
                      onClick={() => handleRemoveCartItem(item.id)}
                      className="inline-flex items-center justify-center bg-[#e60000] text-white px-2 py-1 rounded hover:bg-red-700"
                      title="Entfernen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div id="cart-summary" className="mt-4 mb-8 text-right font-bold text-lg">
            Gesamtbetrag: {total.toFixed(2)} €<br />
            <span className="text-sm font-normal text-gray-600">
              Enthaltene MwSt (19%): {mwst.toFixed(2)} €
            </span>
          </div>
        </div>

        {/* STEP 1: Zahlungsdaten + Buchungsübersicht + Zahlungsbestätigung */}
        {step === 1 && (
          <div id="checkout-step1-container">
            <form
              className="bg-white p-6 rounded-xl shadow-sm"
              onSubmit={async e => {
                e.preventDefault();
                if (!form.paymentMethod || !form.name || !form.street || !form.zipCode || !form.city || !form.country) {
                  setError("Bitte alle Felder ausfüllen!");
                  return;
                }
                setError("");

                // Zahlungsbestätigung (außer PayPal)
                if (form.paymentMethod !== "PAYPAL") {
                  try {
                    const res = await fetch("/api/checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ paymentMethod: form.paymentMethod, address: form }),
                    });
                    if (res.ok) {
                      const result = await res.json();
                      setCheckoutResult(result);
                      setStep(2); // Danke-Seite
                    } else {
                      setError("Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.");
                    }
                  } catch (error) {
                    setError("Interner Serverfehler. Bitte versuchen Sie es später erneut.");
                  }
                }
                // PayPal-Button handled das selbst (siehe useEffect)
              }}
            >
              <h2 className="text-xl font-bold mb-4">Zahlungsdaten</h2>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Zahlungsmethode</label>
                <div  className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-3 focus-within:outline-none focus-within:ring-2 focus-within:ring-red-300">
                  <select
                    required
                    className="w-full pe-3 py-2 text-gray-900 focus:outline-none"
                    value={form.paymentMethod}
                    onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                  >
                    <option value="">Bitte wählen</option>
                    <option value="BANK_TRANSFER">Überweisung</option>
                    <option value="INVOICE">Rechnung</option>
                    <option value="PAYPAL">PayPal</option>
                  </select>
                </div>
              </div>
              <h2 className="text-xl font-bold mb-4">Rechnungsadresse</h2>
              <input
                className="mb-2 w-full bg-white rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
              />
              <input
                className="mb-2 w-full bg-white rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                required
                value={form.street}
                onChange={e => setForm({ ...form, street: e.target.value })}
                placeholder="Straße"
              />
              <input
                className="mb-2 w-full bg-white rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                required
                value={form.zipCode}
                onChange={e => setForm({ ...form, zipCode: e.target.value })}
                placeholder="PLZ"
              />
              <input
                className="mb-2 w-full bg-white rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                required
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                placeholder="Ort"
              />
              <input
                className="mb-2 w-full bg-white rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                required
                value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })}
                placeholder="Land"
              />
              <input
                className="mb-2 w-full bg-white rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                required
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="E-Mail"
              />
              {error && <div className="text-red-600 mb-2">{error}</div>}

              <div className="flex justify-end gap-4 mt-4">
                <button type="button" className="px-4 py-2 bg-gray-300 rounded-xl cursor-pointer" onClick={() => window.location.href = "/cart"}>Abbrechen</button>
                {/* Button nur anzeigen, wenn NICHT PayPal */}
                {form.paymentMethod !== "PAYPAL" && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#e60000] text-white rounded-xl hover:bg-red-700 cursor-pointer"
                  >
                    Zahlung bestätigen
                  </button>
                )}
              </div>
              {/* PayPal-Button */}
              {form.paymentMethod === "PAYPAL" && (
                <div id="paypal-button-container" className="mt-4"></div>
              )}
            </form>
          </div>
        )}

        {/* STEP 2: Danke-Seite */}
        {step === 2 && (
          <div id="checkout-step2-container">
            <div
              id="checkout-step2"
              className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow text-center">
              <h2 className="text-2xl font-bold mb-4 text-green-700">Vielen Dank für Ihre Buchung!</h2>
              <div className="mb-4">Ihre Zahlung war erfolgreich.</div>
              <button className="px-4 py-2 bg-[#e60000] text-white rounded-xl hover:bg-red-700 cursor-pointer" onClick={() => window.location.href = "/events"}>
                Zurück zu Events
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
