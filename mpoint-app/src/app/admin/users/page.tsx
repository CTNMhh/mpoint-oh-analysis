"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");

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

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
    setConfirmDeleteId(id);
  }

  async function confirmDelete(id: string) {
    setConfirmDeleteId(null);
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else {
      setError("Fehler beim Löschen.");
    }
  }

  // Filter und Sortierung
  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valA = a[sortBy as keyof typeof a];
    let valB = b[sortBy as keyof typeof b];
    
    if (sortBy === "name") {
      valA = `${a.firstName} ${a.lastName}`;
      valB = `${b.firstName} ${b.lastName}`;
    }
    
    if (sortBy === "createdAt" || sortBy === "updatedAt") {
      valA = valA ? new Date(valA).getTime() : 0;
      valB = valB ? new Date(valB).getTime() : 0;
    }
    
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function handleSort(col: string) {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  }

  const getRoleBadgeStyle = (role: string) => {
    switch(role?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PREMIUM':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'USER':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Benutzerverwaltung</h1>
                <p className="text-sm text-gray-500">{users.length} Benutzer insgesamt</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowForm((v) => {
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
              className={`inline-flex items-center gap-2 px-5 py-2.5 font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                showForm 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
              }`}
            >
              {showForm ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Abbrechen
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Neuer Benutzer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Nach Name, E-Mail oder Benutzername suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Gefiltert:</span>
              <span className="font-semibold text-gray-900">{sortedUsers.length} Benutzer</span>
            </div>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <form onSubmit={handleCreate}>
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Neuen Benutzer anlegen
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-Mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="beispiel@domain.de"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benutzername <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="benutzername"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passwort <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="password"
                    placeholder="Sicheres Passwort"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anrede <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={form.anrede}
                    onChange={(e) => setForm({ ...form, anrede: e.target.value })}
                  >
                    <option value="">Bitte wählen</option>
                    <option value="Herr">Herr</option>
                    <option value="Frau">Frau</option>
                    <option value="divers">Divers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titel
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={form.titel}
                    onChange={(e) => setForm({ ...form, titel: e.target.value })}
                  >
                    <option value="">Kein Titel</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Prof. Dr.">Prof. Dr.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vorname <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Max"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nachname <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Mustermann"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md"
                >
                  Benutzer speichern
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Table Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
              <p className="text-gray-500">Lade Benutzer...</p>
            </div>
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Benutzer gefunden</h3>
              <p className="text-gray-500">
                {searchTerm ? "Versuchen Sie eine andere Suche." : "Legen Sie den ersten Benutzer an."}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200/50 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Benutzer
                      {sortBy === "name" && (
                        <span className="text-red-500">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200/50 transition-colors"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-2">
                      E-Mail
                      {sortBy === "email" && (
                        <span className="text-red-500">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Details
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200/50 transition-colors"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center gap-2">
                      Rolle
                      {sortBy === "role" && (
                        <span className="text-red-500">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200/50 transition-colors"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Registriert
                      {sortBy === "createdAt" && (
                        <span className="text-red-500">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {user.anrede} {user.titel && `${user.titel}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeStyle(user.role)}`}>
                        {user.role || 'USER'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString("de-DE", { 
                              day: "2-digit", 
                              month: "2-digit", 
                              year: "numeric" 
                            })
                          : "-"}
                      </div>
                      {user.createdAt && (
                        <div className="text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleTimeString("de-DE", { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Bearbeiten
                        </Link>
                        {/* Delete button is commented out to prevent accidental deletions 
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Löschen
                        </button>
                        */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Benutzer löschen?</h3>
                  <p className="text-sm text-gray-500">Diese Aktion kann nicht rückgängig gemacht werden.</p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Abbrechen
                </button>
                {/*
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  onClick={() => confirmDelete(confirmDeleteId)}
                >
                  Endgültig löschen
                </button>
                */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}