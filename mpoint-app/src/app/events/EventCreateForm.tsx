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
    chargeFree: false,
    categories: "",
    calendarGoogle: "",
    calendarIcs: "",
    description: "",
    status: "DRAFT",      // NEU: Default auf DRAFT (nicht sofort veröffentlicht)
    isActive: false,      // NEU: Default NICHT aktiv (explizite Entscheidung erforderlich)
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
          price: form.chargeFree ? 0 : form.price,  // Preis = 0 wenn kostenfrei
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || data.message || "Fehler beim Erstellen.");
      } else {
        // Form zurücksetzen
        setForm({
          title: "",
          imageUrl: "",
          startDate: "",
          endDate: "",
          location: "",
          ventType: "",
          price: 0,
          chargeFree: false,
          categories: "",
          calendarGoogle: "",
          calendarIcs: "",
          description: "",
          status: "DRAFT",      // NEU: Reset auf DRAFT
          isActive: false,      // NEU: Reset auf NICHT aktiv
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

      {/* Warnung wenn veröffentlicht aber nicht aktiv */}
      {form.status === "PUBLISHED" && !form.isActive && (
        <div className="text-amber-600 mb-4 rounded-xl bg-amber-50 px-4 py-2 border border-amber-200">
          ⚠️ Hinweis: Das Event wird veröffentlicht aber ist nicht aktiv. Es wird sichtbar sein, aber keine Buchungen sind möglich.
        </div>
      )}

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

        {/* PREIS-SEKTION mit Kostenfrei-Option */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Preis (€)</label>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
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

        {/* NEU: Status-Auswahl */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Veröffentlichungsstatus</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            <option value="DRAFT">Als Entwurf speichern</option>
            <option value="PUBLISHED">Sofort veröffentlichen</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {form.status === "DRAFT"
              ? "Event wird gespeichert aber noch nicht öffentlich angezeigt"
              : "Event wird nach dem Speichern sofort sichtbar"}
          </p>
        </div>

        {/* NEU: Aktiv-Checkbox */}
        <div className="flex items-center">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="mr-2"
            />
            Event aktivieren
          </label>
          <p className="text-xs text-gray-500 ml-2">
            {form.isActive
              ? "✓ Event ist buchbar"
              : "Event ist pausiert"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Google Kalender Link</label>
          <input
            value={form.calendarGoogle}
            disabled={true}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
            placeholder="Wird automatisch generiert..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ICS Link</label>
          <input
            value={form.calendarIcs}
            disabled={true}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
            placeholder="Wird automatisch generiert..."
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
          {creating ? "Wird erstellt..." :
           form.status === "DRAFT" ? "Als Entwurf speichern" :
           form.isActive ? "Event veröffentlichen & aktivieren" : "Event veröffentlichen (inaktiv)"}
        </button>
      </div>
    </form>
  );
}