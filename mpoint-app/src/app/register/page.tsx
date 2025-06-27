'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
    password2: "",
    anrede: "",
    titel: "",
    firstName: "",
    lastName: "",
    email: "",
    privacy: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.password2) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    if (!form.privacy) {
      setError("Bitte stimmen Sie den Datenschutzbestimmungen zu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          anrede: form.anrede,
          titel: form.titel,
          firstName: form.firstName,
          lastName: form.lastName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registrierung fehlgeschlagen.");
        setLoading(false);
        return;
      }
      // User im Context speichern (nur wenn API die Daten zurückgibt!)
      if (data.user) {
        setUser({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
        });
      }
      router.push("/");
    } catch (err) {
      setError("Serverfehler. Bitte versuche es später erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="w-full flex justify-center pt-40 pb-20">
        <form
          className="bg-white/90 p-10 rounded-2xl shadow-2xl w-full max-w-lg space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="text-2xl font-bold mb-2 text-center">REGISTRIERUNG</div>
          <div className="text-gray-700 text-sm mb-4">
            Herzlich willkommen bei M-POINT!<br />
            Bitte beachte beim Erstellen Deines Benutzernamens, dass dieser einen wichtigen Teil Deines Profils darstellt. Dein Benutzername wird bei all Deinen Aktivitäten sichtbar sein, sei es beim Schreiben von Nachrichten, Erstellen von Events oder in anderen Interaktionen innerhalb unseres Portals. Wähle daher einen Namen, der Dich gut repräsentiert und mit dem Du Dich wohlfühlst.<br />
            Viel Spaß und Erfolg in unserer Community!
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <input
            name="username"
            type="text"
            placeholder="Benutzername *"
            className="border px-4 py-2 rounded-lg w-full"
            required
            value={form.username}
            onChange={handleChange}
          />
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 text-sm">Anrede *</label>
              <select
                name="anrede"
                className="border px-4 py-2 rounded-lg w-full"
                required
                value={form.anrede}
                onChange={handleChange}
              >
                <option value="">———</option>
                <option value="Herr">Herr</option>
                <option value="Frau">Frau</option>
                <option value="divers">divers</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="block mb-1 text-sm">Titel</label>
              <select
                name="titel"
                className="border px-4 py-2 rounded-lg w-full"
                value={form.titel}
                onChange={handleChange}
              >
                <option value="">———</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
                <option value="Prof. Dr.">Prof. Dr.</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <input
              name="firstName"
              type="text"
              placeholder="Vorname *"
              className="border px-4 py-2 rounded-lg w-full"
              required
              value={form.firstName}
              onChange={handleChange}
            />
            <input
              name="lastName"
              type="text"
              placeholder="Nachname *"
              className="border px-4 py-2 rounded-lg w-full"
              required
              value={form.lastName}
              onChange={handleChange}
            />
          </div>
          <input
            name="email"
            type="email"
            placeholder="E-Mail *"
            className="border px-4 py-2 rounded-lg w-full"
            required
            value={form.email}
            onChange={handleChange}
          />
          <div className="flex gap-4">
            <input
              name="password"
              type="password"
              placeholder="Passwort *"
              className="border px-4 py-2 rounded-lg w-full"
              required
              value={form.password}
              onChange={handleChange}
            />
            <input
              name="password2"
              type="password"
              placeholder="Passwort bestätigen"
              className="border px-4 py-2 rounded-lg w-full"
              required
              value={form.password2}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="privacy"
              id="privacy"
              checked={form.privacy}
              onChange={handleChange}
              required
            />
            <label htmlFor="privacy" className="text-sm">
              Bitte stimmen Sie unseren{" "}
              <a href="/datenschutz" target="_blank" className="underline">
                Datenschutzbestimmungen
              </a>{" "}
              zu
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[rgb(228,25,31)] text-white font-medium transition-colors flex items-center justify-center gap-1 py-3 rounded-lg hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Wird gesendet..." : <>Registrieren <ChevronRight className="w-4 h-4" /></>}
          </button>
          <div className="text-center mt-2">
            <a href="/login" className="text-indigo-600 underline">
              Zugang vorhanden? Hier anmelden
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}