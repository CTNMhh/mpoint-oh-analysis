"use client";
import { useEffect, useState } from "react";

type Event = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  price?: number;
  organizer?: string;
  categories?: string;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Event>>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    price: 0,
    organizer: "",
    categories: "",
    imageUrl: "",
  });

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const res = await fetch("/api/admin/events");
      if (res.ok) {
        setEvents(await res.json());
      } else {
        setError("Fehler beim Laden der Events.");
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newEvent = await res.json();
      setEvents((prev) => [newEvent, ...prev]);
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
        price: 0,
        organizer: "",
        categories: "",
        imageUrl: "",
      });
    } else {
      setError("Fehler beim Erstellen.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Event wirklich löschen?")) return;
    const res = await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } else {
      setError("Fehler beim Löschen.");
    }
  }




  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-4">Lade Events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Events verwalten</h1>
        <button
          className="mb-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
          onClick={() => {
            setShowForm((v) => !v);
            setForm({
              title: "",
              description: "",
              startDate: "",
              endDate: "",
              location: "",
              price: 0,
              organizer: "",
              categories: "",
              imageUrl: "",
            });
          }}
        >
          {showForm ? "Abbrechen" : "Neues Event"}
        </button>

        {/* Event Create Form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-8 bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6"
          >
            <h2 className="text-xl font-semibold">Neues Event anlegen</h2>
            <input
              required
              type="text"
              placeholder="Titel"
              className="w-full border rounded px-3 py-2"
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              placeholder="Beschreibung"
              className="w-full border rounded px-3 py-2"
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              required
              type="date"
              placeholder="Startdatum"
              className="w-full border rounded px-3 py-2"
              value={form.startDate?.slice(0, 10) || ""}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <input
              type="date"
              placeholder="Enddatum"
              className="w-full border rounded px-3 py-2"
              value={form.endDate?.slice(0, 10) || ""}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
            <input
              type="text"
              placeholder="Ort"
              className="w-full border rounded px-3 py-2"
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <input
              type="number"
              placeholder="Preis"
              className="w-full border rounded px-3 py-2"
              value={form.price?.toString() || ""}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <input
              type="text"
              placeholder="Veranstalter"
              className="w-full border rounded px-3 py-2"
              value={form.organizer || ""}
              onChange={(e) => setForm({ ...form, organizer: e.target.value })}
            />
            <input
              type="text"
              placeholder="Kategorien"
              className="w-full border rounded px-3 py-2"
              value={form.categories || ""}
              onChange={(e) => setForm({ ...form, categories: e.target.value })}
            />
            <input
              type="text"
              placeholder="Bild-URL"
              className="w-full border rounded px-3 py-2"
              value={form.imageUrl || ""}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
            >
              Event erstellen
            </button>
          </form>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
            {error}
          </div>
        )}

        {/* Events Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-6 py-4 text-left">Titel</th>
                <th className="px-6 py-4 text-left">Datum</th>
                <th className="px-6 py-4 text-left">Ort</th>
                <th className="px-6 py-4 text-left">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{event.title}</td>
                  <td className="px-6 py-4">
                    {event.startDate
                      ? new Date(event.startDate).toLocaleDateString()
                      : ""}
                    {event.endDate
                      ? " - " + new Date(event.endDate).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="px-6 py-4">{event.location}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                      onClick={() => window.location.href = `/admin/events/${event.id}/edit`}
                    >
                      Bearbeiten
                    </button>
                    <button
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      onClick={() => handleDelete(event.id)}
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500">
                    Keine Events gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}