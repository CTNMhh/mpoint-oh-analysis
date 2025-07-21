// filepath: mpoint-app/src/app/admin/events/[id]/edit/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      const res = await fetch(`/api/admin/events?id=${id}`);
      if (res.ok) {
        const event = await res.json();
        setForm({
          title: event.title || "",
          description: event.description || "",
          startDate: event.startDate ? event.startDate.slice(0, 10) : "",
          endDate: event.endDate ? event.endDate.slice(0, 10) : "",
          location: event.location || "",
          price: event.price ?? 0,
          organizer: event.organizer || "",
          categories: event.categories || "",
          imageUrl: event.imageUrl || "",
        });
      } else {
        setError("Event nicht gefunden.");
      }
      setLoading(false);
    }
    if (id) fetchEvent();
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/admin/events?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push("/admin/events");
    } else {
      setError("Fehler beim Aktualisieren.");
    }
  }

  if (loading) return <div>Lade Event...</div>;

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Event bearbeiten</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          required
          type="text"
          placeholder="Titel"
          className="w-full border rounded px-3 py-2"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          placeholder="Beschreibung"
          className="w-full border rounded px-3 py-2"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <input
          required
          type="date"
          placeholder="Startdatum"
          className="w-full border rounded px-3 py-2"
          value={form.startDate}
          onChange={e => setForm({ ...form, startDate: e.target.value })}
        />
        <input
          type="date"
          placeholder="Enddatum"
          className="w-full border rounded px-3 py-2"
          value={form.endDate}
          onChange={e => setForm({ ...form, endDate: e.target.value })}
        />
        <input
          type="text"
          placeholder="Ort"
          className="w-full border rounded px-3 py-2"
          value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })}
        />
        <input
          type="number"
          placeholder="Preis"
          className="w-full border rounded px-3 py-2"
          value={form.price?.toString() || ""}
          onChange={e => setForm({ ...form, price: Number(e.target.value) })}
        />
        <input
          type="text"
          placeholder="Veranstalter"
          className="w-full border rounded px-3 py-2"
          value={form.organizer}
          onChange={e => setForm({ ...form, organizer: e.target.value })}
        />
        <input
          type="text"
          placeholder="Kategorien"
          className="w-full border rounded px-3 py-2"
          value={form.categories}
          onChange={e => setForm({ ...form, categories: e.target.value })}
        />
        <input
          type="text"
          placeholder="Bild-URL"
          className="w-full border rounded px-3 py-2"
          value={form.imageUrl}
          onChange={e => setForm({ ...form, imageUrl: e.target.value })}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
        >
          Speichern
        </button>
      </form>
    </div>
  );
}