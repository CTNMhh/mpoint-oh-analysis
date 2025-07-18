"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    anrede: "",
    titel: "",
  });

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        setUsers(await res.json());
      } else {
        setError("Fehler beim Laden der Nutzer.");
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newUser = await res.json();
      setUsers((prev) => [newUser, ...prev]);
      setShowForm(false);
      setForm({
        email: "",
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        anrede: "",
        titel: "",
      });
    } else {
      setError("Fehler beim Erstellen.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Wirklich löschen?")) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else {
      setError("Fehler beim Löschen.");
    }
  }

  return (
    <main className="max-w-6xl mx-auto py-12">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-800">
        Benutzerverwaltung
      </h1>
      <button
        className={`mb-6 px-6 py-2 rounded-lg font-semibold shadow transition 
    ${
      showForm
        ? "bg-gray-400 text-white hover:bg-gray-500"
        : "bg-blue-600 text-white hover:bg-blue-700"
    }`}
        onClick={() => {
          setShowForm((v) => {
            // Wenn Formular geöffnet wird, Felder leeren
            if (!v) {
              setForm({
                email: "",
                firstName: "",
                lastName: "",
                username: "",
                password: "",
                anrede: "",
                titel: "",
              });
            }
            return !v;
          });
        }}
      >
        {showForm ? "Abbrechen" : "Neuen Benutzer anlegen"}
      </button>

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow space-y-6 border"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-blue-900">E-Mail *</label>
              <input
                required
                placeholder="E-Mail"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-blue-900">Vorname *</label>
              <input
                required
                placeholder="Vorname"
                className="input"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-blue-900">Nachname *</label>
              <input
                required
                placeholder="Nachname"
                className="input"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-blue-900">Benutzername *</label>
              <input
                required
                placeholder="Benutzername"
                className="input"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-blue-900">Passwort *</label>
              <input
                required
                type="password"
                placeholder="Passwort"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            {/* Anrede und Titel als Select */}
            <div>
              <label className="block mb-1 font-medium text-blue-900">Anrede *</label>
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
              <label className="block mb-1 font-medium text-blue-900">Titel</label>
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
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition"
          >
            Benutzer speichern
          </button>
        </form>
      )}

      {error && <div className="text-red-600 mb-4 font-semibold">{error}</div>}

      {loading ? (
        <div className="text-blue-700 font-semibold">Lade Benutzer...</div>
      ) : (
        <div className=" mx-auto overflow-x-auto">
          <table className="w-full bg-white rounded-2xl shadow border">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-3 text-left font-semibold text-blue-900">
                  Benutzername
                </th>
                <th className="p-3 text-left font-semibold text-blue-900">
                  E-Mail
                </th>
                <th className="p-3 text-left font-semibold text-blue-900">
                  Anrede
                </th>
                <th className="p-3 text-left font-semibold text-blue-900">
                  Titel
                </th>
                <th className="p-3 text-left font-semibold text-blue-900">
                  Vorname
                </th>
                <th className="p-3 text-left font-semibold text-blue-900">
                  Nachname
                </th>
                <th className="p-3 text-left font-semibold text-blue-900">
                  Letzte Änderung
                </th>
                <th className="p-3 text-left font-semibold text-blue-900">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email} className="hover:bg-blue-50 transition">
                  <td className="p-3">{user.username}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.anrede}</td>
                  <td className="p-3">{user.titel || "-"}</td>
                  <td className="p-3">{user.firstName}</td>
                  <td className="p-3">{user.lastName}</td>
                  <td className="p-3">
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-3 flex gap-2">
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="px-4 py-1 bg-yellow-500 text-white rounded-lg font-semibold shadow hover:bg-yellow-600 transition"
                    >
                      Bearbeiten
                    </Link>
                    <button
                      className="px-4 py-1 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition"
                      onClick={() => handleDelete(user.id)}
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Extra: kleine CSS für Inputs */}
      <style jsx>{`
        .input {
          @apply w-full border border-blue-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition;
        }
      `}</style>
    </main>
  );
}