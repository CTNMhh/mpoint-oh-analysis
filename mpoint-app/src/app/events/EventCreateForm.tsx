// mpoint\mpoint-app\src\app\events\EventCreateForm.tsx
// Erweiterte Version mit Pflichtfeld für maximale Teilnehmerzahl
// Für M-POINT 3.0 mit Hamburg-spezifischen Event-Typen

import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import {
  generateGoogleCalendarLink,
  generateICSLink,
} from "@/utils/calendarLinks";
import { Button, PrimaryButton, GrayButton } from "../components/ui/Button";

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

export default function EventCreateForm({
  onCreated,
  onCancel,
}: EventCreateFormProps) {
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    startDate: "",
    endDate: "",
    location: "",
    ventType: "",
    price: 0,
    chargeFree: false,
    maxParticipants: "", // NEU: Als String für bessere Eingabe-Kontrolle
    categories: "",
    calendarGoogle: "",
    calendarIcs: "",
    description: "",
    status: "DRAFT",
    isActive: false,
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Kalender-Links automatisch generieren
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

    // Validierung der Pflichtfelder
    if (
      !form.title ||
      !form.startDate ||
      !form.location ||
      !form.ventType ||
      !form.description
    ) {
      setError("Bitte füllen Sie alle Pflichtfelder aus.");
      setCreating(false);
      return;
    }

    // NEU: Validierung der maximalen Teilnehmerzahl (PFLICHTFELD!)
    const maxParticipants = parseInt(form.maxParticipants);
    if (
      !form.maxParticipants ||
      isNaN(maxParticipants) ||
      maxParticipants < 1
    ) {
      setError(
        "⚠️ Die maximale Teilnehmerzahl ist ein Pflichtfeld! Bitte geben Sie mindestens 1 Person an."
      );
      setCreating(false);
      return;
    }

    // Warnung bei sehr großen Events
    if (maxParticipants > 500) {
      const confirmed = window.confirm(
        `Sie planen ein Event für ${maxParticipants} Personen. Ist das korrekt?`
      );
      if (!confirmed) {
        setCreating(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categories: form.categories
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c),
          price: form.chargeFree ? 0 : form.price,
          maxParticipants: maxParticipants, // NEU: Als Zahl senden
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
          maxParticipants: "",
          categories: "",
          calendarGoogle: "",
          calendarIcs: "",
          description: "",
          status: "DRAFT",
          isActive: false,
        });
        const data = await res.json();
        onCreated(data);
      }
    } catch (err) {
      setError("Fehler beim Erstellen des Events.");
    }
    setCreating(false);
  }

  return (
    <form
      onSubmit={handleCreate}
      className="space-y-6 bg-white rounded-xl shadow p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Neues Event erstellen
        </h2>
        <Calendar className="w-6 h-6 text-[#e60000]" />
      </div>

      {error && (
        <div className="text-[#e60000] mb-2 rounded-xl bg-red-50 px-4 py-2 border border-red-200">
          {error}
        </div>
      )}

      {/* Warnung wenn veröffentlicht aber nicht aktiv */}
      {form.status === "PUBLISHED" && !form.isActive && (
        <div className="text-amber-600 mb-4 rounded-xl bg-amber-50 px-4 py-2 border border-amber-200">
          ⚠️ Hinweis: Das Event wird veröffentlicht aber ist nicht aktiv. Es
          wird sichtbar sein, aber keine Buchungen sind möglich.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Titel */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Titel <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-white rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
            placeholder="z.B. Business Networking Hamburg"
          />
        </div>

        {/* Bild-Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Bild-Upload
          </label>
          <div className="w-full bg-white rounded-lg shadow-sm mb-2 focus-within:outline-none focus-within:ring-2 focus-within:ring-red-300">
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
              className="w-full px-3 py-2 focus:outline-none"
            />
          </div>
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="Event Bild"
              className="w-full h-40 object-cover rounded mb-2 border"
            />
          )}
        </div>

        {/* Startdatum */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Startdatum <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={toLocalDateTimeInputValue(form.startDate)}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full bg-white rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
            type="datetime-local"
          />
        </div>

        {/* Enddatum */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Enddatum
          </label>
          <input
            value={toLocalDateTimeInputValue(form.endDate)}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full bg-white rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
            type="datetime-local"
          />
        </div>

        {/* Ort */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Ort <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full bg-white rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
            placeholder="z.B. Hamburg Speicherstadt, Elbphilharmonie"
          />
        </div>

        {/* Veranstaltungstyp - Hamburg-spezifisch */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Veranstaltungstyp <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-3 focus-within:outline-none focus-within:ring-2 focus-within:ring-red-300">
            <select
              required
              value={form.ventType}
              onChange={(e) => setForm({ ...form, ventType: e.target.value })}
              className="w-full pe-3 py-2 text-gray-900 focus:outline-none"
            >
              <option value="">Bitte wählen...</option>
              <optgroup label="M-POINT Hamburg Events">
                <option value="Main-Event">
                  🎯 Main-Event (Großveranstaltung)
                </option>
                <option value="Gruppen-Treffen">👥 Gruppen-Treffen</option>
                <option value="Themen-Treffen">💡 Themen-Treffen</option>
                <option value="Business-Matching">🤝 Business-Matching</option>
              </optgroup>
              <optgroup label="Weitere Event-Typen">
                <option value="Networking">🔗 Networking</option>
                <option value="Workshop">🛠️ Workshop</option>
                <option value="Seminar">📚 Seminar</option>
                <option value="Konferenz">🎤 Konferenz</option>
                <option value="Mentoring">🧑‍🏫 Mentoring</option>
                <option value="Online">💻 Online-Event</option>
                <option value="Hybrid">🔄 Hybrid-Event</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* 🆕 MAXIMALE TEILNEHMERZAHL - PFLICHTFELD */}
        <div className="md:col-span-2 bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Maximale Teilnehmerzahl <span className="text-[#e60000]">*</span>
            <span className="text-xs text-gray-600 ml-2">
              (Pflichtangabe für alle Events)
            </span>
          </label>
          <div className="relative">
            <input
              required
              value={form.maxParticipants}
              onChange={(e) => {
                const value = e.target.value;
                // Nur Zahlen erlauben
                if (value === "" || /^\d+$/.test(value)) {
                  setForm({ ...form, maxParticipants: value });
                }
              }}
              className="w-full bg-white rounded-lg shadow-sm outline-yellow-400 px-3 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg font-bold"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="z.B. 50"
              min="1"
              max="9999"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold">
              Plätze
            </span>
          </div>
          <div className="mt-2 text-sm">
            {!form.maxParticipants && (
              <p className="text-red-600 font-semibold">
                ⚠️ Pflichtfeld - Bitte angeben!
              </p>
            )}
            {form.maxParticipants && parseInt(form.maxParticipants) > 0 && (
              <div className="text-gray-600">
                {parseInt(form.maxParticipants) <= 10 && (
                  <div>
                    🏠 <strong>Kleines Event</strong> - Ideal für intensive
                    Workshops und persönlichen Austausch
                  </div>
                )}
                {parseInt(form.maxParticipants) > 10 &&
                  parseInt(form.maxParticipants) <= 30 && (
                    <div>
                      🏢 <strong>Mittleres Event</strong> - Perfekt für
                      Gruppen-Treffen und Themen-Workshops
                    </div>
                  )}
                {parseInt(form.maxParticipants) > 30 &&
                  parseInt(form.maxParticipants) <= 100 && (
                    <div>
                      🏛️ <strong>Großes Event</strong> - Gut für
                      Networking-Events und Konferenzen
                    </div>
                  )}
                {parseInt(form.maxParticipants) > 100 &&
                  parseInt(form.maxParticipants) <= 200 && (
                    <div>
                      🏟️ <strong>Main-Event</strong> - Großveranstaltung in
                      Hamburg
                    </div>
                  )}
                {parseInt(form.maxParticipants) > 200 && (
                  <div>
                    🌟 <strong>Mega-Event</strong> - Großveranstaltung für{" "}
                    {form.maxParticipants} Personen
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preis-Sektion */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-600 mb-2">
            <input
              type="checkbox"
              checked={form.chargeFree}
              onChange={(e) => {
                const isChargeFree = e.target.checked;
                setForm({
                  ...form,
                  chargeFree: isChargeFree,
                  price: isChargeFree ? 0 : form.price,
                });
              }}
              className="mr-2"
            />
            Event ist kostenfrei
          </label>
          {!form.chargeFree && (
            <>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Preis pro Person (€)
              </label>
              <input
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                className="w-full bg-white rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
              />
              {form.price > 0 &&
                form.maxParticipants &&
                parseInt(form.maxParticipants) > 0 && (
                  <p className="text-xs text-green-600 mt-1 font-semibold">
                    💰 Maximaler Umsatz: €
                    {(form.price * parseInt(form.maxParticipants)).toFixed(2)}
                  </p>
                )}
            </>
          )}
        </div>

        {/* Kategorien */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Kategorien
          </label>
          <input
            value={form.categories}
            onChange={(e) => setForm({ ...form, categories: e.target.value })}
            className="w-full bg-white rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
            placeholder="Business, Networking, Hamburg, M-POINT"
          />
          <p className="text-xs text-gray-600 mt-1">Komma-getrennt eingeben</p>
        </div>

        {/* Status-Auswahl */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Veröffentlichungsstatus
          </label>
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-3 focus-within:outline-none focus-within:ring-2 focus-within:ring-red-300">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full pe-3 py-2 text-gray-900 focus-within:outline-none"
            >
              <option value="DRAFT">Als Entwurf speichern</option>
              <option value="PUBLISHED">Sofort veröffentlichen</option>
            </select>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {form.status === "DRAFT"
              ? "Event wird gespeichert aber noch nicht öffentlich angezeigt"
              : "Event wird nach dem Speichern sofort sichtbar"}
          </p>
        </div>

        {/* Aktiv-Checkbox */}
        <div className="flex items-center">
          <label className="flex items-center text-sm font-medium text-gray-600">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="mr-2"
            />
            Event aktivieren (Buchungen erlauben)
          </label>
        </div>

        {/* Kalender-Links (automatisch generiert) */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Google Kalender Link
          </label>
          <input
            value={form.calendarGoogle}
            disabled={true}
            className="w-full bg-white rounded-lg shadow-sm px-3 py-2 disabled:border-gray-200 disabled:text-gray-400"
            placeholder="Wird automatisch generiert..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            ICS Link
          </label>
          <input
            value={form.calendarIcs}
            disabled={true}
            className="w-full bg-white rounded-lg shadow-sm px-3 py-2 disabled:border-gray-200 disabled:text-gray-400"
            placeholder="Wird automatisch generiert..."
          />
        </div>
      </div>

      {/* Beschreibung */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Beschreibung <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-white rounded-lg shadow-sm px-3 py-2 focus-within:outline-none focus-within:ring-2 focus-within:ring-red-300"
          placeholder="Beschreiben Sie das Event detailliert..."
          rows={4}
        />
      </div>

      {/* 🆕 Event-Zusammenfassung mit Teilnehmer-Info */}
      {form.title &&
        form.maxParticipants &&
        parseInt(form.maxParticipants) > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              📋 Event-Übersicht:
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <div className="mb-1">
                  📍 <strong>Titel:</strong> {form.title}
                </div>
                <div className="mb-1">
                  👥 <strong>Max. Teilnehmer:</strong> {form.maxParticipants}{" "}
                  Personen
                </div>
                {form.location && (
                  <div className="mb-1">
                    📌 <strong>Ort:</strong> {form.location}
                  </div>
                )}
                {form.ventType && (
                  <div className="mb-1">
                    🎯 <strong>Typ:</strong> {form.ventType}
                  </div>
                )}
              </div>
              <div>
                {form.chargeFree ? (
                  <div className="mb-1">
                    💰 <strong>Kostenfreies Event</strong>
                  </div>
                ) : (
                  form.price > 0 && (
                    <>
                      <div className="mb-1">
                        💰 <strong>Preis:</strong> €{form.price.toFixed(2)} pro
                        Person
                      </div>
                      <div className="mb-1">
                        💵 <strong>Max. Umsatz:</strong> €
                        {(form.price * parseInt(form.maxParticipants)).toFixed(
                          2
                        )}
                      </div>
                    </>
                  )
                )}
                <div className="mb-1">
                  📅 <strong>Status:</strong>{" "}
                  {form.status === "DRAFT" ? "Entwurf" : "Wird veröffentlicht"}
                </div>
                <div>
                  ✅ <strong>Buchungen:</strong>{" "}
                  {form.isActive ? "Aktiviert" : "Deaktiviert"}
                </div>
              </div>
            </div>

            {/* Spezieller Hinweis für Main-Events */}
            {form.ventType === "Main-Event" && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-800">
                  🎯 <strong>Main-Event:</strong> Eines der 4 jährlichen
                  Hauptevents in der Metropolregion Hamburg
                </p>
              </div>
            )}
          </div>
        )}

      {/* Aktions-Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <GrayButton
          type="button"
          onClick={onCancel}
          disabled={creating}
        >
          Abbrechen
        </GrayButton>
        <PrimaryButton
          type="submit"
          disabled={creating || !form.maxParticipants}
        >
          {creating
            ? "Wird erstellt..."
            : !form.maxParticipants
            ? "⚠️ Bitte Teilnehmerzahl angeben"
            : form.status === "DRAFT"
            ? "Als Entwurf speichern"
            : form.isActive
            ? "Event veröffentlichen & aktivieren"
            : "Event veröffentlichen (inaktiv)"}
        </PrimaryButton>
      </div>
    </form>
  );
}
