"use client";

import React, { useState, useEffect } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState({
    username: "",
    email: "",
    anrede: "",
    titel: "",
    firstName: "",
    lastName: "",
    password: "", // Für neue Passwort-Eingabe
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();

        if (!res.ok) {
          console.log(data.error || "Fehler beim Abrufen der Benutzerdaten.");
          setError(data.error || "Fehler beim Abrufen der Benutzerdaten.");
          setLoading(false);
          return;
        }

        setUser({
          ...data,
          password: "", // Passwort-Feld leer lassen
        });
      } catch (err) {
        setError("Serverfehler. Bitte versuchen Sie es später erneut.");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fehler beim Aktualisieren der Benutzerdaten.");
        return;
      }

      setSuccessMessage(data.message || "Profil erfolgreich aktualisiert!");

      // Header-Benutzerdaten aktualisieren
      if (typeof window !== "undefined" && window.refreshHeaderUser) {
        window.refreshHeaderUser();
      }

      // Passwort-Feld zurücksetzen
      setUser((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setError("Serverfehler. Bitte versuchen Sie es später erneut.");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Lädt...</div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 pb-10 pt-30">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        {/* Header mit Anrede und Username */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mein Profil</h1>
          <div className="mt-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">Angemeldet als:</span>{" "}
              {user.anrede && user.firstName && user.lastName
                ? `${user.anrede} ${user.titel ? user.titel + ' ' : ''}${user.firstName} ${user.lastName}`
                : "Wird geladen..."}
            </p>
            <p>
              <span className="font-medium">Benutzername:</span>{" "}
              <span className="text-[rgb(228,25,31)] font-medium">
                @{user.username || "Wird geladen..."}
              </span>
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Erste Reihe: Benutzername, E-Mail, Titel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Benutzername */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Benutzername *
              </label>
              <input
                type="text"
                name="username"
                value={user.username}
                onChange={handleChange}
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                @{user.username}
              </p>
            </div>

            {/* E-Mail */}
            <div>
              <label className="block text-sm font-medium mb-1">E-Mail *</label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
                required
              />
            </div>

            {/* Titel */}
            <div>
              <label className="block text-sm font-medium mb-1">Titel</label>
              <input
                type="text"
                name="titel"
                value={user.titel || ""}
                onChange={handleChange}
                placeholder="z.B. Dr., Prof."
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              />
            </div>
          </div>

          {/* Zweite Reihe: Anrede, Vorname, Nachname */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Anrede */}
            <div>
              <label className="block text-sm font-medium mb-1">Anrede *</label>
              <select
                name="anrede"
                value={user.anrede}
                onChange={handleChange}
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
                required
              >
                <option value="">Bitte wählen</option>
                <option value="Herr">Herr</option>
                <option value="Frau">Frau</option>
                <option value="Divers">Divers</option>
              </select>
            </div>

            {/* Vorname */}
            <div>
              <label className="block text-sm font-medium mb-1">Vorname *</label>
              <input
                type="text"
                name="firstName"
                value={user.firstName}
                onChange={handleChange}
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
                required
              />
            </div>

            {/* Nachname */}
            <div>
              <label className="block text-sm font-medium mb-1">Nachname *</label>
              <input
                type="text"
                name="lastName"
                value={user.lastName}
                onChange={handleChange}
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Passwort */}
          <div>
            <label className="block text-sm font-medium mb-1">Neues Passwort</label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder="Leer lassen, um Passwort beizubehalten"
              className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-1">
              Mindestens 6 Zeichen. Leer lassen, wenn Sie Ihr Passwort nicht ändern
              möchten.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[rgb(228,25,31)] text-white font-medium py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </form>
      </div>
    </main>
  );
}