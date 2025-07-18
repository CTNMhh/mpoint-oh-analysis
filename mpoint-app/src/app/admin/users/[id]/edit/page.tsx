"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    anrede: "",
    titel: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const res = await fetch(`/api/admin/users?id=${userId}`);
      if (res.ok) {
        const user = await res.json();
        setForm({
          email: user.email || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          username: user.username || "",
          password: "",
          anrede: user.anrede || "",
          titel: user.titel || "",
        });
      } else {
        setError("Benutzer nicht gefunden.");
      }
      setLoading(false);
    }
    if (userId) fetchUser();
  }, [userId]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/admin/users?id=${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push("/admin/users");
    } else {
      setError("Fehler beim Aktualisieren.");
    }
  }

  return (
    <main className="max-w-5xl mx-auto py-12">
      <h1 className="text-3xl font-extrabold mb-8 text-blue-800">
        Benutzer bearbeiten
      </h1>
      {loading ? (
        <div className="text-blue-700 font-semibold">Lade Benutzerdaten...</div>
      ) : error ? (
        <div className="text-red-600 mb-4 font-semibold">{error}</div>
      ) : (
        <form
          onSubmit={handleUpdate}
          className="bg-gradient-to-br from-yellow-50 to-white p-8 rounded-2xl shadow space-y-6 border"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-yellow-900">E-Mail *</label>
              <input
                required
                placeholder="E-Mail"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-yellow-900">Vorname *</label>
              <input
                required
                placeholder="Vorname"
                className="input"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-yellow-900">Nachname *</label>
              <input
                required
                placeholder="Nachname"
                className="input"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-yellow-900">Benutzername *</label>
              <input
                required
                placeholder="Benutzername"
                className="input"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-yellow-900">Passwort</label>
              <input
                type="password"
                placeholder="Passwort (leer lassen für unverändert)"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-yellow-900">Anrede *</label>
              <select
                required
                className="input"
                value={form.anrede}
                onChange={(e) => setForm({ ...form, anrede: e.target.value })}
              >
                <option value="">———</option>
                <option value="Herr">Herr</option>
                <option value="Frau">Frau</option>
                <option value="divers">divers</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium text-yellow-900">Titel</label>
              <select
                className="input"
                value={form.titel}
                onChange={(e) => setForm({ ...form, titel: e.target.value })}
              >
                <option value="">———</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
                <option value="Prof. Dr.">Prof. Dr.</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-semibold shadow hover:bg-yellow-600 transition"
            >
              Benutzer aktualisieren
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
              onClick={() => router.push("/admin/users")}
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}
      <style jsx>{`
        .input {
          @apply w-full border border-blue-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition;
        }
      `}</style>
    </main>
  );
}