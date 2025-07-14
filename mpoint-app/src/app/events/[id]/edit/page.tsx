"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function EditEventPage({ params }: { params: { id: string } }) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      const res = await fetch(`/api/events/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
        setForm({
          ...data,
          categories: Array.isArray(data.categories) ? data.categories.join(", ") : data.categories || "",
          calendarGoogle: data.calendarLinks?.google || "",
          calendarIcs: data.calendarLinks?.ics || "",
        });
      }
      setLoading(false);
    }
    fetchEvent();
  }, [params.id]);

  useEffect(() => {
    if (form?.title && form?.startDate) {
      setForm((prev: any) => ({
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
    form?.title,
    form?.startDate,
    form?.endDate,
    form?.description,
    form?.location,
  ]);

  if (loading || !form) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)]"></div>
      </main>
    );
  }

  // Nur Ersteller darf bearbeiten
  if (event.user.email !== session?.user?.email) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Keine Berechtigung
          </h2>
          <p className="mb-6 text-gray-600">
            Nur der Ersteller kann dieses Event bearbeiten.
          </p>
        </div>
      </main>
    );
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = {
      ...form,
      price: Number(form.price),
      categories: Array.isArray(form.categories)
        ? form.categories
        : form.categories.split(",").map((c: string) => c.trim()),
      startDate: form.startDate
        ? new Date(form.startDate).toISOString()
        : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      calendarLinks: {
        google: form.calendarGoogle || "",
        ics: form.calendarIcs || "",
      },
    };
    const res = await fetch(`/api/events/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      router.push(`/events/${params.id}`);
    } else {
      const err = await res.json();
      setError(err.error || "Fehler beim Bearbeiten.");
    }
    setSaving(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br pt-40 from-gray-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <Link
          href={`/events`}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-yellow-500 hover:text-white transition-colors font-semibold shadow"
        >
          <span className="text-xl">&larr;</span> Zurück zum Event
        </Link>
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Event bearbeiten</h1>
        {error && <div className="text-red-600 mb-2 rounded-xl bg-red-50 px-4 py-2">{error}</div>}
        <form onSubmit={handleEdit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titel*</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                placeholder="Titel des Events"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bild-Upload</label>
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
                className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
              />
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Event Bild"
                  className="w-full h-40 object-cover rounded mb-2 border"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum*</label>
              <input
                required
                value={toLocalDateTimeInputValue(form.startDate)}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                type="datetime-local"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enddatum</label>
              <input
                value={toLocalDateTimeInputValue(form.endDate)}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                type="datetime-local"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ort*</label>
              <input
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                placeholder="Ort oder Online-Link"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veranstaltungstyp*</label>
              <input
                required
                value={form.ventType}
                onChange={(e) => setForm({ ...form, ventType: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                placeholder="z.B. Mentoring, Netzwerk"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preis (€)</label>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                type="number"
                min={0}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategorien</label>
              <input
                value={form.categories}
                onChange={(e) => setForm({ ...form, categories: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                placeholder="Komma-getrennt, z.B. Business, Online"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Kalender Link</label>
              <input
                value={form.calendarGoogle}
                disabled={true}
                onChange={(e) => setForm({ ...form, calendarGoogle: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                placeholder="https://calendar.google.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ICS Link</label>
              <input
                value={form.calendarIcs}
                disabled={true}
                onChange={(e) => setForm({ ...form, calendarIcs: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                placeholder="https://deinserver.de/event.ics"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung*</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Beschreibe das Event..."
              rows={4}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-yellow-500 text-white px-6 py-2 rounded-full hover:bg-yellow-600 transition-colors font-semibold shadow"
              disabled={saving}
            >
              {saving ? "Wird gespeichert..." : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}