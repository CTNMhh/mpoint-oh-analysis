// mpoint\mpoint-app\src\app\events\[id]\page.tsx

"use client";

import { notFound } from "next/navigation";
import { useEffect, useState, use } from "react"; // NEU: use importieren
import { Calendar } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { EventType, EventStatus } from "../types";

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
  const [bookings, setBookings] = useState<any[]>([]);
  const [spaces, setSpaces] = useState(1); // NEU: State für Anzahl Plätze
  const { data: session, status } = useSession();

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

  // Buchungen laden, wenn User der Ersteller ist
  useEffect(() => {
    if (
      event &&
      session?.user?.email &&
      event.user.email.toLowerCase() === session.user.email.toLowerCase()
    ) {
      fetch(`/api/bookings?eventId=${event.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          console.log("Geladene Buchungen:", data);
          setBookings(data);
        });
    }
  }, [event, session?.user?.email]);

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

  return (
    <main className="min-h-screen pt-30 bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
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

        {event.chargeFree && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSuccess(null);
              setError(null);

              const form = e.currentTarget;
              const formData = new FormData(form);

              const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  eventId: event.id,
                  name: formData.get("name"),
                  email: formData.get("email"),
                  spaces: Number(formData.get("spaces") || 1), // GEÄNDERT: spaces aus Formular
                  comment: formData.get("comment"),
                  userId: session?.user?.id || null,
                }),
              });

              if (res.ok) {
                const spacesBooked = Number(formData.get("spaces") || 1);
                setSuccess(`Anmeldung erfolgreich! ${spacesBooked} ${spacesBooked === 1 ? 'Platz' : 'Plätze'} gebucht.`);

                form.reset();
                const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
                const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
                const spacesInput = form.querySelector('input[name="spaces"]') as HTMLInputElement;

                if (nameInput && session?.user) nameInput.value = fullName;
                if (emailInput && session?.user) emailInput.value = userEmail;
                if (spacesInput) spacesInput.value = "1";
                setSpaces(1); // NEU: Reset spaces state
              } else {
                const err = await res.json();
                setError(err.error || "Fehler bei der Anmeldung.");
              }
            }}
            className="bg-gray-50 rounded-xl p-6 mt-8 space-y-4"
          >
            {success && <div className="text-green-700 bg-green-50 rounded px-4 py-2 mb-2">{success}</div>}
            {error && <div className="text-red-700 bg-red-50 rounded px-4 py-2 mb-2">{error}</div>}
            <h3 className="font-semibold text-lg mb-2">
              {session?.user ? 'Schnellanmeldung' : 'Jetzt kostenlos anmelden'}
            </h3>

            {session?.user ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-700">Angemeldet als: <strong>{fullName}</strong></p>
                </div>
                <input
                  name="name"
                  required
                  defaultValue={fullName}
                  placeholder="Ihr Name"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                <input
                  name="email"
                  required
                  type="email"
                  defaultValue={userEmail}
                  placeholder="Ihre E-Mail"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </>
            ) : (
              <>
                <input
                  name="name"
                  required
                  placeholder="Ihr Name"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <input
                  name="email"
                  required
                  type="email"
                  placeholder="Ihre E-Mail"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </>
            )}

            {/* NEU: Erweiterte Spaces-Eingabe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anzahl Plätze *
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSpaces(Math.max(1, spaces - 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  disabled={spaces <= 1}
                >
                  −
                </button>
                <input
                  name="spaces"
                  type="number"
                  min={1}
                  max={10}
                  value={spaces}
                  onChange={(e) => setSpaces(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-20 text-center border border-gray-300 rounded px-3 py-2 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setSpaces(Math.min(10, spaces + 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  disabled={spaces >= 10}
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {spaces === 1 ? '1 Platz' : `${spaces} Plätze`} werden gebucht
              </p>
            </div>

            <textarea
              name="comment"
              placeholder="Kommentar (optional)"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <button
              type="submit"
              className="bg-[rgb(228,25,31)] text-white px-6 py-3 rounded-lg hover:bg-green-700 w-full font-semibold transition-colors"
            >
              Anmelden
            </button>
          </form>
        )}

        {!event.chargeFree && event.price > 0 && (
          <>
            {/* NEU: Spaces-Auswahl für bezahlte Events */}
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

            <button
              className="bg-[rgb(228,25,31)] text-white px-8 py-3 rounded-xl hover:bg-red-700 transition-colors font-semibold w-full text-lg shadow-lg"
              onClick={async () => {
                setSuccess(null);
                setError(null);
                const res = await fetch("/api/bookings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    eventId: event.id,
                    name: fullName,
                    email: userEmail,
                    spaces: spaces, // GEÄNDERT: spaces variable statt 1
                    userId: session?.user?.id || null,
                  }),
                });
                if (res.ok) {
                  setSuccess(`Anmeldung erfolgreich! ${spaces} ${spaces === 1 ? 'Ticket' : 'Tickets'} gebucht.`);
                  setSpaces(1); // NEU: Reset nach Buchung
                } else {
                  const err = await res.json();
                  setError(err.error || "Fehler bei der Anmeldung.");
                }
              }}
            >
              Jetzt anmelden (€{(event.price * spaces).toFixed(2)}) {/* GEÄNDERT: Preis * spaces */}
            </button>
            {success && (
              <div className="text-green-700 bg-green-50 rounded px-4 py-2 mt-2 text-center">{success}</div>
            )}
            {error && (
              <div className="text-red-700 bg-red-50 rounded px-4 py-2 mt-2 text-center">{error}</div>
            )}
          </>
        )}

        {/* Buchungsliste für Ersteller */}
        {event.user.email.toLowerCase() === session?.user?.email?.toLowerCase() && (
          <div className="mb-10">
            <h3 className="font-semibold text-lg mb-4">Buchungen für dieses Event</h3>

            {/* Statistik-Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600">Buchungen</div>
                <div className="text-2xl font-bold text-blue-900">{bookings.length}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600">Gebuchte Plätze</div>
                <div className="text-2xl font-bold text-green-900">
                  {bookings.reduce((sum, b) => sum + b.spaces, 0)}
                  {event.maxParticipants && (
                    <span className="text-sm font-normal"> / {event.maxParticipants}</span>
                  )}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600">Gesamtumsatz</div>
                <div className="text-2xl font-bold text-purple-900">
                  {bookings.reduce((sum, b) => sum + b.totalAmount, 0).toFixed(2)} €
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-yellow-600">Offene Zahlungen</div>
                <div className="text-2xl font-bold text-yellow-900">
                  {bookings
                    .filter(b => b.paymentStatus === 'PENDING')
                    .reduce((sum, b) => sum + b.totalAmount, 0)
                    .toFixed(2)} €
                </div>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="text-gray-500">Noch keine Buchungen vorhanden.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-sm font-semibold">Name</th>
                      <th className="px-3 py-2 text-sm font-semibold">E-Mail</th>
                      <th className="px-3 py-2 text-sm font-semibold text-center">Plätze</th>
                      <th className="px-3 py-2 text-sm font-semibold text-right">Betrag</th>
                      <th className="px-3 py-2 text-sm font-semibold">Status</th>
                      <th className="px-3 py-2 text-sm font-semibold">Gebucht am</th>
                      <th className="px-3 py-2 text-sm font-semibold">Kommentar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm">{b.name}</td>
                        <td className="px-3 py-2 text-sm">{b.email}</td>
                        <td className="px-3 py-2 text-sm text-center">{b.spaces}</td>
                        <td className="px-3 py-2 text-sm text-right font-medium">
                          {b.totalAmount > 0 ? `${b.totalAmount.toFixed(2)} €` : 'Kostenfrei'}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <PaymentStatusBadge status={b.paymentStatus} />
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">{b.comment || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td colSpan={2} className="px-3 py-2 text-sm">Gesamt</td>
                      <td className="px-3 py-2 text-sm text-center">
                        {bookings.reduce((sum, b) => sum + b.spaces, 0)}
                      </td>
                      <td className="px-3 py-2 text-sm text-right">
                        {bookings.reduce((sum, b) => sum + b.totalAmount, 0).toFixed(2)} €
                      </td>
                      <td colSpan={3} className="px-3 py-2 text-sm text-gray-600">
                        Bezahlt: {
                          bookings
                            .filter(b => b.paymentStatus === 'PAID')
                            .reduce((sum, b) => sum + b.totalAmount, 0)
                            .toFixed(2)
                        } €
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Export-Button */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => exportBookingsAsCSV(bookings, event)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm font-semibold"
              >
                Buchungen als CSV exportieren
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

// Payment Status Badge Komponente
function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NOT_REQUIRED: 'bg-gray-100 text-gray-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-green-100 text-green-700',
    REFUNDED: 'bg-blue-100 text-blue-700',
    FAILED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-orange-100 text-orange-700'
  };

  const labels: Record<string, string> = {
    NOT_REQUIRED: 'Kostenfrei',
    PENDING: 'Offen',
    PAID: 'Bezahlt',
    REFUNDED: 'Erstattet',
    FAILED: 'Fehlgeschlagen',
    CANCELLED: 'Storniert'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status] || styles.PENDING}`}>
      {labels[status] || status}
    </span>
  );
}

function exportBookingsAsCSV(bookings: any[], event: any) {
  const csvRows = [
    ["Name", "E-Mail", "Plätze", "Preis/Platz", "Gesamt", "Status", "Gebucht am", "Kommentar"],
    ...bookings.map(b => [
      b.name,
      b.email,
      b.spaces,
      b.pricePerSpace.toFixed(2),
      b.totalAmount.toFixed(2),
      b.paymentStatus,
      new Date(b.createdAt).toLocaleDateString(),
      b.comment || ""
    ])
  ];

  const csvContent = csvRows.map(row =>
    row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")
  ).join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title}_Buchungen_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}