"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type EventType = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  location: string;
  ventType: string;
  price: number;
  categories: string[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

type BookingType = {
  id: string;
  spaces: number;
  event: EventType;
};

export default function EventsPage() {
  const { status, data: session } = useSession();
  const [events, setEvents] = useState<EventType[]>([]);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);

  // Lade alle Events
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
      setLoading(false);
    }
    if (status === "authenticated") {
      fetchEvents();
    }
  }, [status]);

  // Lade alle Buchungen des Users
  useEffect(() => {
    async function fetchBookings() {
      const res = await fetch("/api/my-bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    }
    if (status === "authenticated") {
      fetchBookings();
    }
  }, [status]);

  if (loading || status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)]"></div>
      </main>
    );
  }

  // Eigene Events filtern
  const myEvents = events.filter(
    (event) => event.user.email === session?.user?.email
  );

  return (
    <main className="min-h-screen bg-gradient-to-br pt-40 from-gray-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Meine gebuchten Events
        </h2>
        {bookings.length === 0 ? (
          <div className="text-gray-500 mb-12">Du hast noch keine Events gebucht.</div>
        ) : (
          <div className="mb-12">
            <table className="w-full border rounded-xl overflow-hidden shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Titel</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Datum</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Ort</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Preis</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Plätze</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Details</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-4">{booking.event.title}</td>
                    <td className="py-2 px-4">
                      {new Date(booking.event.startDate).toLocaleString()}
                    </td>
                    <td className="py-2 px-4">{booking.event.location}</td>
                    <td className="py-2 px-4">
                      {booking.event.price === 0
                        ? <span className="text-green-700 font-semibold">Kostenlos</span>
                        : <span className="font-semibold">{booking.event.price} €</span>
                      }
                    </td>
                    <td className="py-2 px-4">{booking.spaces}</td>
                    <td className="py-2 px-4">
                      <Link
                        href={`/events/${booking.event.id}`}
                        className="text-blue-600 underline"
                      >
                        Event ansehen
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
          Meine erstellten Events
        </h1>
        {myEvents.length === 0 ? (
          <p className="text-center text-gray-500">
            Du hast noch keine Events erstellt.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {myEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow p-6 flex flex-col"
              >
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="rounded-lg mb-4 h-40 object-cover"
                  />
                )}
                <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                <div className="text-gray-600 mb-2">
                  {new Date(event.startDate).toLocaleString()} – {event.location}
                </div>
                <div className="text-gray-700 font-medium mb-2">
                  Preis:{" "}
                  {event.price === 0 ? (
                    <span className="text-green-700 font-semibold">Kostenlos</span>
                  ) : (
                    <span className="font-semibold">{event.price} €</span>
                  )}
                </div>
                <div className="text-gray-500 text-sm mb-2">
                  Veranstalter:{" "}
                  <span className="font-semibold">{event.ventType}</span>
                </div>
                <div className="mb-4 line-clamp-3">{event.description}</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {event.categories.map((cat) => (
                    <span
                      key={cat}
                      className="bg-gray-100 text-xs px-2 py-1 rounded"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <div className="mt-auto">
                  <Link
                    href={`/events/${event.id}`}
                    className="bg-[rgb(228,25,31)] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-center block"
                  >
                    Details & Anmeldung
                  </Link>
                </div>
                <Link
                  href={`/events/${event.id}/edit`}
                  className="mt-2 inline-block px-4 py-2 bg-yellow-400 text-gray-900 font-semibold shadow hover:bg-yellow-500 transition-colors text-center"
                >
                  Event bearbeiten
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}