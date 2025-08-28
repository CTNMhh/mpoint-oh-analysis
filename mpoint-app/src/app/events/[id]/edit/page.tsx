// mpoint\mpoint-app\src\app\events\[id]\edit\page.tsx

"use client";
import { useEffect, useState, use } from "react"; // use war schon importiert
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateGoogleCalendarLink, generateICSLink } from "@/utils/calendarLinks";
import { EventType, EventStatus } from "../../types";

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

const statusLabels: Record<EventStatus, string> = {
  DRAFT: "Entwurf",
  PUBLISHED: "Veröffentlicht",
  FULL: "Voll",
  CANCELLED: "Abgesagt",
};

// GEÄNDERT: params ist jetzt ein Promise
export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  // NEU: params unwrappen INNERHALB der Funktion
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const { status, data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}`); // eventId ist jetzt definiert
      if (res.ok) {
        const data = await res.json();

        // Nach dem Laden des Events:
        const statusFromApi = data.status;
        const enumStatus =
          Object.keys(statusLabels).includes(statusFromApi) ||
          statusFromApi === "DRAFT"
            ? statusFromApi
            : Object.entries(statusLabels).find(
                ([, label]) => label === statusFromApi
              )?.[0] || "DRAFT";

        setEvent(data);
        setForm({
          ...data,
          status: enumStatus,
          chargeFree: data.chargeFree ?? false,
          categories: Array.isArray(data.categories)
            ? data.categories.join(", ")
            : data.categories || "",
          calendarGoogle: data.calendarLinks?.google || "",
          calendarIcs: data.calendarLinks?.ics || "",
        });
      }
      setLoading(false);
    }
    fetchEvent();
  }, [eventId]); // eventId als dependency

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
      price: form.chargeFree ? 0 : Number(form.price),
      chargeFree: form.chargeFree ?? false,
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
    console.log("Sende an Backend:", body.status);
    const res = await fetch(`/api/events/${eventId}`, { // eventId ist jetzt definiert
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      router.push(`/events/${eventId}`); // eventId ist jetzt definiert
    } else {
      const err = await res.json();
      setError(err.error || "Fehler beim Bearbeiten.");
    }
    setSaving(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
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
                  setForm({ ...form, imageUrl: data.url });
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximale Teilnehmerzahl
              </label>
              <input
                type="number"
                min={0}
                name="maxParticipants"
                value={form.maxParticipants ?? ""}
                onChange={e => setForm({ ...form, maxParticipants: e.target.value ? Number(e.target.value) : null })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leer lassen oder 0 für unbegrenzt
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <input
                  type="checkbox"
                  checked={form.chargeFree}
                  onChange={(e) => {
                    const isChargeFree = e.target.checked;
                    setForm({
                      ...form,
                      chargeFree: isChargeFree,
                      price: isChargeFree ? 0 : form.price
                    });
                  }}
                  className="mr-2"
                />
                Event ist kostenfrei
              </label>
              {!form.chargeFree && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Preis (€)</label>
                  <input
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                    type="number"
                    min={0}
                    placeholder="0"
                  />
                </>
              )}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as EventStatus })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                required
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aktiv</label>
              <input
                type="checkbox"
                checked={form.isActive ?? false}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className="mr-2"
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
