"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState<{ id: string, items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // Initialwert ist 0
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
            setStep(3); // Danke-Seite anzeigen
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
    }
  }

  if (loading) return <div className="py-8 text-center">Lädt...</div>;
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="mt-20 py-8 text-gray-500 text-center">
        Es sind keine Event-Buchungen im Warenkorb vorhanden
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Warenkorb</h1>
      <table className="w-full text-xs border rounded-xl overflow-hidden shadow bg-white">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase leading-tight">
            <th className="py-2 px-2 text-left">Event</th>
            <th className="py-2 px-2 text-center">Plätze</th>
            <th className="py-2 px-2 text-right">Gesamt</th>
            <th className="py-2 px-2 text-center">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map((item) => (
            <tr key={item.id}>
              <td className="py-2 px-2 border-b truncate max-w-[120px]">{item.event?.title}</td>
              <td className="py-2 px-2 border-b text-center">{item.spaces}</td>
              <td className="py-2 px-2 border-b text-right">{item.event?.price ? (item.event.price * item.spaces).toFixed(2) + " €" : "Kostenfrei"}</td>
              <td className="py-2 px-2 border-b text-center">
                <button
                  onClick={() => handleRemoveCartItem(item.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                >
                  Entfernen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-right font-bold text-lg">
        Gesamtbetrag: {cart.items.reduce((sum, item) => sum + ((item.event?.price || 0) * item.spaces), 0).toFixed(2)} €
      </div>
      <div className="mt-6 flex justify-end">
        <button
          className="bg-green-600 text-white px-6 py-2 rounded text-sm hover:bg-green-700"
          onClick={() => setStep(1)}
        >
          Zur Kasse
        </button>
      </div>

      {step === 1 && (
        <form
          className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow"
          onSubmit={e => {
            e.preventDefault();
            if (!form.paymentMethod || !form.name || !form.street || !form.zipCode || !form.city || !form.country) {
              setError("Bitte alle Felder ausfüllen!");
              return;
            }
            setError("");
            setStep(2);
          }}
        >
          <h2 className="text-xl font-bold mb-4">Zahlungsdaten</h2>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Zahlungsmethode</label>
            <select
              required
              className="w-full border px-2 py-1 rounded"
              value={form.paymentMethod}
              onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option value="">Bitte wählen</option>
              <option value="BANK_TRANSFER">Überweisung</option>
              <option value="INVOICE">Rechnung</option>
              <option value="PAYPAL">PayPal</option>
            </select>
          </div>
          <h2 className="text-xl font-bold mb-4">Rechnungsadresse</h2>
          <input
            className="mb-2 w-full border px-2 py-1"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
          />
          <input
            className="mb-2 w-full border px-2 py-1"
            required
            value={form.street}
            onChange={e => setForm({ ...form, street: e.target.value })}
            placeholder="Straße"
          />
          <input
            className="mb-2 w-full border px-2 py-1"
            required
            value={form.zipCode}
            onChange={e => setForm({ ...form, zipCode: e.target.value })}
            placeholder="PLZ"
          />
          <input
            className="mb-2 w-full border px-2 py-1"
            required
            value={form.city}
            onChange={e => setForm({ ...form, city: e.target.value })}
            placeholder="Ort"
          />
          <input
            className="mb-2 w-full border px-2 py-1"
            required
            value={form.country}
            onChange={e => setForm({ ...form, country: e.target.value })}
            placeholder="Land"
          />
          <input
            className="mb-2 w-full border px-2 py-1"
            required
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="E-Mail"
          />
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <div className="flex justify-end gap-4 mt-4">
            <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setStep(0)}>Abbrechen</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Weiter</button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Buchungsübersicht</h2>
          <table className="w-full text-xs mb-4">
            <thead>
              <tr>
                <th>Event</th>
                <th>Plätze</th>
                <th>Gesamt</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map(item => (
                <tr key={item.id}>
                  <td>{item.event?.title}</td>
                  <td className="text-center">{item.spaces}</td>
                  <td className="text-right">{item.event?.price ? (item.event.price * item.spaces).toFixed(2) + " €" : "Kostenfrei"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mb-4 font-semibold">
            Gesamtbetrag: {cart.items.reduce((sum, item) => sum + (item.event?.price || 0) * item.spaces, 0).toFixed(2)} €
          </div>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <div className="flex justify-end gap-4">
            <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setStep(1)}>Zurück</button>
            {/* Button nur anzeigen, wenn NICHT PayPal */}
            {form.paymentMethod !== "PAYPAL" && (
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={async () => {
                  setError("");
                  try {
                    // API-Call zum Checkout
                    const res = await fetch("/api/checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ paymentMethod: form.paymentMethod, address: form }),
                    });
                    if (res.ok) {
                      const result = await res.json();
                      setCheckoutResult(result);
                      setStep(3);
                    } else {
                      setError("Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.");
                    }
                  } catch (error) {
                    console.error("Fehler im Checkout:", error);
                    setError("Interner Serverfehler. Bitte versuchen Sie es später erneut.");
                  }
                }}
              >
                Zahlung bestätigen
              </button>
            )}
          </div>
          {form.paymentMethod === "PAYPAL" && (
            <div id="paypal-button-container" className="mt-4"></div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-700">Vielen Dank für Ihre Buchung!</h2>
          <div className="mb-4">Ihre Zahlung war erfolgreich.</div>
          <h3 className="font-bold mb-2">Buchungsübersicht</h3>
          <table className="w-full text-xs mb-4">
            <thead>
              <tr>
                <th>Event</th>
                <th>Plätze</th>
                <th>Gesamt</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map(item => (
                <tr key={item.id}>
                  <td>{item.event?.title}</td>
                  <td className="text-center">{item.spaces}</td>
                  <td className="text-right">{item.event?.price ? (item.event.price * item.spaces).toFixed(2) + " €" : "Kostenfrei"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mb-4 font-semibold">
            Gesamtbetrag: {cart.items.reduce((sum, item) => sum + (item.event?.price || 0) * item.spaces, 0).toFixed(2)} €
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => window.location.href = "/events"}>
            Zurück zu Events
          </button>
        </div>
      )}
    </div>
  );
}