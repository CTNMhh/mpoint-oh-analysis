// mpoint\mpoint-app\src\app\events\[id]\page.tsx

"use client";

import { notFound } from "next/navigation";
import { useEffect, useState, use } from "react";
import { Button, PrimaryButton } from "@/components/Button";
import { Calendar, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { EventType, EventStatus } from "../types";
import { useCart, MiniCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // React 19+ unwrap (falls Promise), sonst direkt nutzen
  const resolvedParams =
    typeof (params as any)?.then === "function" ? use(params as Promise<{ id: string }>) : (params as { id: string });
  const eventId = resolvedParams.id;

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [spaces, setSpaces] = useState(1);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { refreshCart } = useCart();
  const [showMiniCart, setShowMiniCart] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      } else {
        setEvent(null);
      }
      setLoading(false);
    }
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Frühzeitige Returns NACH allen Hooks:
  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Anmeldung erforderlich
          </h2>
          <p className="mb-6 text-gray-600">
            Bitte loggen Sie sich ein, um die Events zu sehen und zu erstellen.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-[#e60000] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Zum Login
          </a>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e60000] mx-auto mb-4"></div>
          <p className="text-gray-600">Lädt Event...</p>
        </div>
      </main>
    );
  }

  if (!event) return notFound();

  // Automatische Werte aus der Session
  const fullName = session?.user
    ? `${session.user.firstName} ${session.user.lastName}`
    : "";
  const userEmail = session?.user?.email || "";

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
      setShowMiniCart(true);
    } else {
      setError("Fehler beim Hinzufügen zum Warenkorb.");
    }
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 pt-20">
        {/* ...vor <div className="max-w-3xl mx-auto ..."> */}

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-100 text-red-800 font-semibold text-center shadow">
            {error}
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Zurück zu Events */}
          <Button
            href="/events"
            icon={ArrowLeft}
            variant="primary"
          >
            Zurück zu Events
          </Button>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Event-Detail-Block: 2/3 */}
            <div
              id="event-detail-block"
              className="bg-white rounded-xl shadow-sm p-6 flex-1 basis-2/3"
            >
              <div className="flex flex-col gap-6">
                {/* Event exportieren */}
                {/*
                <div className="w-1/2 flex justify-end items-center">
                  <button
                    type="button"
                    onClick={() => exportEventAsCSV(event)}
                    className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-500 font-semibold shadow flex items-center justify-center text-sm"
                    >
                    Event exportieren
                  </button>
                </div>
                */}
                {/* Event-Titel, Bild, Infos */}
                <div className="flex flex-col md:flex-row items-start mb-6 gap-6">
                  <h1 className="text-2xl font-bold mb-6 text-gray-900">
                    {event.title}
                    {event.active && (
                      <span className="ml-3 px-3 py-1 bg-green-100 text-green-700 text-base rounded font-semibold align-middle">
                        Aktiv
                      </span>
                    )}
                  </h1>
                  <div className="mb-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg font-semibold">
                      {event.user.email === session?.user?.email
                        ? event.status
                        : event.status === EventStatus.FULL ||
                          event.status === EventStatus.CANCELLED
                        ? event.status
                        : null}
                    </span>
                  </div>
                  {event.imageUrl && (
                    <div className="flex justify-end grow">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="rounded-lg h-40 w-40 object-cover border border-gray-200 bg-linear-to-r from-gray-200 to-gray-300"
                      />
                    </div>
                  )}
                </div>
                <div className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md">
                  <div className="font-semibold text-gray--700 mb-2">
                    Veranstalter: {event.ventType}
                  </div>
                  <div className="text-gray-600 mb-2">
                    📅 {new Date(event.startDate).toLocaleString()}
                    {event.endDate && (
                      <> – {new Date(event.endDate).toLocaleString()}</>
                    )}{" "}
                    – {event.location}
                  </div>
                  {!event.chargeFree && event.price > 0 && (
                    <div className="text-gray-700 mt-3 font-medium">
                      Preis:{" "}
                      <span className="font-semibold">{event.price} €</span>
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
                    <span className="font-semibold">
                      Zum Kalender hinzufügen:
                    </span>
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
                  <div className="text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md">
                    <label className="block text-base font-semibold text-gray-600 mb-2">
                      Beschreibung
                    </label>
                    {event.description}
                  </div>
                </div>

                {/* Ticket-Auswahl für alle Events */}
                <div className="flex flex-row items-end">
                  <div className="flex flex-col gap-2 grow">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Anzahl Tickets:
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        onClick={() => setSpaces(Math.max(1, spaces - 1))}
                        variant="primary"
                        size="sm"
                        className="w-10 h-10 rounded-full"
                      >
                        −
                      </Button>
                      <span className="w-10 text-center font-bold text-lg">
                        {spaces}
                      </span>
                      <Button
                        type="button"
                        onClick={() => setSpaces(Math.min(10, spaces + 1))}
                        variant="primary"
                        size="sm"
                        className="w-10 h-10 rounded-full"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Nur noch EIN Button für alle Events */}
                  <PrimaryButton
                    type="button"
                    onClick={() => handleAddToCart(event.id, spaces)}
                  >
                    In den Warenkorb
                    {event.price > 0
                      ? ` (${(event.price * spaces).toFixed(2)} €)`
                      : ""}
                  </PrimaryButton>
                </div>
              </div>
            </div>

            {/* MiniCart: 1/3 */}
            <div
              id="mini-cart-block"
              className="bg-white rounded-xl shadow-sm flex-1 basis-1/3"
            >
              <MiniCart message={success} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
