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

function generateGoogleCalendarLink({
  title,
  description,
  location,
  startDate,
  endDate,
}: {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
}) {
  if (!title || !startDate) return "";
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toISOString().replace(/[-:]|\.\d{3}/g, "");
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : start;
  const params = new URLSearchParams({
    text: title,
    details: description || "",
    location: location || "",
    dates: `${start}/${end}`,
  });
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&${params.toString()}`;
}

function generateICSLink({
  title,
  description,
  location,
  startDate,
  endDate,
}: {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
}) {
  if (!title || !startDate) return "";
  const dtStart = new Date(startDate)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const dtEnd = endDate
    ? new Date(endDate)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z")
    : dtStart;
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:${title}`,
    `DESCRIPTION:${description || ""}`,
    `LOCATION:${location || ""}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
}

function toLocalDateTimeInputValue(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}

export default function EventsPage() {
  const { status, data: session } = useSession();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    startDate: "",
    endDate: "",
    location: "",
    ventType: "",
    price: 0,
    categories: "",
    calendarGoogle: "",
    calendarIcs: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Events laden
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
  }, [status, creating]);

  // Event erstellen
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    const body = {
      ...form,
      price: Number(form.price),
      categories: form.categories.split(",").map((c) => c.trim()),
      startDate: form.startDate
        ? new Date(form.startDate).toISOString()
        : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      calendarLinks: {
        google: form.calendarGoogle || "",
        ics: form.calendarIcs || "",
      },
    };
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        imageUrl: "",
        startDate: "",
        endDate: "",
        location: "",
        ventType: "",
        price: 0,
        categories: "",
        calendarGoogle: "",
        calendarIcs: "",
      });
    } else {
      const err = await res.json();
      setError(err.error || "Fehler beim Erstellen.");
    }
    setCreating(false);
  }

  useEffect(() => {
    if (form.title && form.startDate) {
      setForm((prev) => ({
        ...prev,
        calendarGoogle: generateGoogleCalendarLink({
          title: prev.title,
          description: prev.description,
          location: prev.location,
          startDate: prev.startDate,
          endDate: prev.endDate,
        }),
        calendarIcs: generateICSLink({
          title: prev.title,
          description: prev.description,
          location: prev.location,
          startDate: prev.startDate,
          endDate: prev.endDate,
        }),
      }));
    }
    // eslint-disable-next-line
  }, [
    form.title,
    form.startDate,
    form.endDate,
    form.description,
    form.location,
  ]);

  if (loading || status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)]"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br pt-40 from-gray-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Events</h1>
          <button
            className="bg-[rgb(228,25,31)] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors font-semibold"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "Abbrechen" : "Event erstellen"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl shadow p-6 mb-8 space-y-6"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Neues Event erstellen
            </h2>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titel*
                </label>
                <input
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="Titel des Events"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bild-Upload
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    });
                    const data = await res.json();
                    setForm({ ...form, imageUrl: data.url }); // URL vom Backend
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Startdatum*
                </label>
                <input
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                  type="datetime-local"
                  value={toLocalDateTimeInputValue(form.startDate)}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enddatum
                </label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                  type="datetime-local"
                  value={toLocalDateTimeInputValue(form.endDate)}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ort*
                </label>
                <input
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="Ort oder Online-Link"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Veranstaltungstyp*
                </label>
                <input
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="z.B. Mentoring, Netzwerk"
                  value={form.ventType}
                  onChange={(e) => setForm({ ...form, ventType: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preis (€)
                </label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorien
                </label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="Komma-getrennt, z.B. Business, Online"
                  value={form.categories}
                  onChange={(e) => setForm({ ...form, categories: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Kalender Link
                </label>
                <input
                  disabled={true}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="https://calendar.google.com/..."
                  value={form.calendarGoogle || ""}
                  onChange={(e) => setForm({ ...form, calendarGoogle: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ICS Link
                </label>
                <input
                  disabled={true}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="https://deinserver.de/event.ics"
                  value={form.calendarIcs || ""}
                  onChange={(e) => setForm({ ...form, calendarIcs: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung*
              </label>
              <textarea
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                placeholder="Beschreibe das Event..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[rgb(228,25,31)] text-white px-6 py-2 rounded hover:bg-red-700 transition-colors font-semibold"
                disabled={creating}
              >
                {creating ? "Wird erstellt..." : "Event anlegen"}
              </button>
            </div>
          </form>
        )}

        {events.length === 0 ? (
          <p className="text-center text-gray-500">Keine Events gefunden.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event) => (
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
                  {event.price === 0
                    ? <span className="text-green-700 font-semibold">Kostenlos</span>
                    : <span className="font-semibold">{event.price} €</span>
                  }
                </div>
                <div className="text-gray-500 text-sm mb-2">
                  Veranstalter: <span className="font-semibold">{event.ventType}</span>
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
                {event.user.email === session?.user?.email && (
                  <Link
                    href={`/events/${event.id}/edit`}
                    className="mt-2 inline-block px-4 py-2 bg-yellow-400 text-gray-900 font-semibold shadow hover:bg-yellow-500 transition-colors text-center"
                  >
                    Event bearbeiten
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}