import React, { useState, useEffect } from "react";
import { generateGoogleCalendarLink, generateICSLink } from "@/utils/calendarLinks";

type EventCreateFormProps = {
  onCreated: (event: any) => void;
  onCancel: () => void;
};

function toLocalDateTimeInputValue(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export default function EventCreateForm({ onCreated, onCancel }: EventCreateFormProps) {
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    startDate: "",
    endDate: "",
    location: "",
    ventType: "",
    price: 0,
    categories: "",
    calendarGoogle: "",
    calendarIcs: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

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
  }, [
    form.title,
    form.description,
    form.location,
    form.startDate,
    form.endDate,
  ]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categories: form.categories.split(",").map((c) => c.trim()),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Fehler beim Erstellen.");
      } else {
        setForm({
          title: "",
          imageUrl: "",
          startDate: "",
          endDate: "",
          location: "",
          ventType: "",
          price: 0,
          categories: "",
          calendarGoogle: "",
          calendarIcs: "",
          description: "",
        });
        const data = await res.json();
        onCreated(data);
      }
    } catch (err) {
      setError("Fehler beim Erstellen.");
    }
    setCreating(false);
  }

  return (
    <form onSubmit={handleCreate} className="space-y-6 bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Neues Event erstellen</h2>
      {error && <div className="text-red-600 mb-2 rounded-xl bg-red-50 px-4 py-2">{error}</div>}
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
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
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
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition-colors font-semibold"
          onClick={onCancel}
          disabled={creating}
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="bg-[rgb(228,25,31)] text-white px-6 py-2 rounded hover:bg-red-700 transition-colors font-semibold"
          disabled={creating}
        >
          {creating ? "Wird erstellt..." : "Event anlegen"}
        </button>
      </div>
    </form>
  );
}