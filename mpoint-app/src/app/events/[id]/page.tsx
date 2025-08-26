// mpoint\mpoint-app\src\app\events\[id]\page.tsx

"use client";

import { notFound } from "next/navigation";
import { useEffect, useState, use } from "react"; // NEU: use importieren
import { Calendar } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { EventType, EventStatus } from "../types";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function EventDetailPage({
  params
}: {
  params: Promise<{ id: string }> // NEU: Promise type
}) {
  // NEU: params unwrappen
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [spaces, setSpaces] = useState(1); // NEU: State für Anzahl Plätze
  const { data: session, status } = useSession();
  const { refreshCart } = useCart();

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}`); // statt params.id
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      } else {
        setEvent(null);
      }
      setLoading(false);
    }
    fetchEvent();
  }, [eventId]); // statt [params.id]

  // Nicht eingeloggt: Hinweis & Login-Button
  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Anmeldung erforderlich
          </h2>
          <p className="mb-6 text-gray-600">
            Bitte loggen Sie sich ein, um die Events zu sehen und zu erstellen.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-[rgb(228,25,31)] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Zum Login
          </a>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)]"></div>
      </main>
    );
  }

  if (!event) return notFound();

  // Automatische Werte aus der Session
  const fullName = session?.user ? `${session.user.firstName} ${session.user.lastName}` : "";
  const userEmail = session?.user?.email || "";

  const router = useRouter();

  async function handleAddToCart(eventId: string, spaces: number = 1) {
    setSuccess(null);
    setError(null);
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, spaces }),
    });
    if (res.ok) {
      setSuccess("Event wurde dem Warenkorb hinzugefügt!");
      refreshCart();
      router.push("/cart"); // <-- Weiterleitung zu /cart
    } else {
      setError("Fehler beim Hinzufügen zum Warenkorb.");
    }
  }

  return (
    <main className="min-h-screen pt-30 bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      {/* ...vor <div className="max-w-3xl mx-auto ..."> */}
      {success && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-green-100 text-green-800 font-semibold text-center shadow">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-100 text-red-800 font-semibold text-center shadow">
          {error}
        </div>
      )}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        {/* Zurück zu Events & Event exportieren */}
        <div className="flex gap-7 mb-8">
          <div className="w-1/2 flex items-center">
            <Link
              href="/events"
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-[rgb(228,25,31)] hover:text-white transition-colors font-semibold shadow text-sm"
            >
              <span className="text-xl">&larr;</span> <span className="ml-1">Zurück zu Events</span>
            </Link>
          </div>
          <div className="w-1/2 flex justify-end items-center">
            <button
              type="button"
              onClick={() => exportEventAsCSV(event)}
              className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-500 font-semibold shadow flex items-center justify-center text-sm"
            >
              Event exportieren
            </button>
          </div>
        </div>

        {/* Event-Titel, Bild, Infos */}
        <div className="flex flex-col md:flex-row items-center mb-8 gap-8">
          <h1 className="text-4xl font-extrabold mb-6 md:mb-0 md:w-1/2 text-[rgb(228,25,31)]">
            {event.title}
            {event.active && (
              <span className="ml-3 px-3 py-1 bg-green-100 text-green-700 text-base rounded font-semibold align-middle">
                Aktiv
              </span>
            )}
          </h1>
          <div className="mb-4">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded font-semibold">
              {event.user.email === session?.user?.email
                ? event.status
                : (event.status === EventStatus.FULL || event.status === EventStatus.CANCELLED)
                  ? event.status
                  : null}
            </span>
          </div>
          {event.imageUrl && (
            <div className="md:w-1/2 w-full flex justify-center">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="rounded-xl h-40 w-40 object-cover shadow-lg border border-gray-200"
              />
            </div>
          )}
        </div>
        <div className="w-full bg-gray-50 rounded-xl px-6 py-4 mb-6 shadow">
          <div className="font-semibold text-gray--700 mb-2">
            Veranstalter: {event.ventType}
          </div>
          <div className="text-gray-600 mb-2">
            📅 {new Date(event.startDate).toLocaleString()}
            {event.endDate && (
              <> – {new Date(event.endDate).toLocaleString()}</>
            )}
            {" "}– {event.location}
          </div>
          {!event.chargeFree && event.price > 0 && (
            <div className="text-gray-700 mt-3 font-medium">
              Preis: <span className="font-semibold">{event.price} €</span>
            </div>
          )}
          {event.chargeFree && (
            <div className="text-green-700 mt-3 font-bold">
              ✓ Kostenfreies Event
            </div>
          )}
        </div>
        {event.calendarLinks && (
          <div className="mb-6 flex items-center gap-4">
            <span className="font-semibold">Zum Kalender hinzufügen:</span>
            {event.calendarLinks.google && (
              <a
                href={event.calendarLinks.google}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-red-600"
              >
                <Calendar size={18} /> Google Kalender
              </a>
            )}
            {event.calendarLinks.ics && (
              <a
                href={event.calendarLinks.ics}
                download="event.ics"
                className="flex items-center gap-1 text-red-600"
              >
                <Calendar size={18} /> ICS herunterladen
              </a>
            )}
          </div>
        )}
        <div className="mb-10">
          <label className="block text-base font-semibold text-gray-600 mb-2">
            Beschreibung
          </label>
          <div className="text-gray-800 text-lg leading-relaxed bg-gray-100 rounded-xl p-4">
            {event.description}
          </div>
        </div>

        {/* Ticket-Auswahl für alle Events */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anzahl Tickets:
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSpaces(Math.max(1, spaces - 1))}
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
            >
              −
            </button>
            <span className="w-20 text-center font-bold text-lg">{spaces}</span>
            <button
              type="button"
              onClick={() => setSpaces(Math.min(10, spaces + 1))}
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Nur noch EIN Button für alle Events */}
        <button
          id="add-to-cart-button"
          type="button"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold w-full text-lg shadow-lg mt-4"
          onClick={() => handleAddToCart(event.id, spaces)}
        >
          In den Warenkorb
          {event.price > 0 ? ` (€${(event.price * spaces).toFixed(2)})` : ""}
        </button>
      </div>
    </main>
  );
}
