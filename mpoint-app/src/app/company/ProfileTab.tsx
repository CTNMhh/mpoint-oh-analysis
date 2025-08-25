import React from "react";

interface ProfileTabProps {
  profile: {
    username: string;
    email: string;
    anrede: string;
    titel?: string;
    firstName: string;
    lastName: string;
    password?: string;
  };
  onChange: (field: string, value: string) => void;
  error?: string | null;
  successMessage?: string | null;
}

export default function ProfileTab({
  profile,
  onChange,
  error,
  successMessage,
}: ProfileTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mein Profil</h2>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Benutzername und E-Mail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benutzername *
            </label>
            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={(e) => onChange("username", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">@{profile.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-Mail *
            </label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={(e) => onChange("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Anrede und Titel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anrede *
            </label>
            <select
              name="anrede"
              value={profile.anrede}
              onChange={(e) => onChange("anrede", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              required
            >
              <option value="">Bitte wählen</option>
              <option value="Herr">Herr</option>
              <option value="Frau">Frau</option>
              <option value="Divers">Divers</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titel
            </label>
            <input
              type="text"
              name="titel"
              value={profile.titel || ""}
              onChange={(e) => onChange("titel", e.target.value)}
              placeholder="z.B. Dr., Prof."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Vorname und Nachname */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vorname *
            </label>
            <input
              type="text"
              name="firstName"
              value={profile.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nachname *
            </label>
            <input
              type="text"
              name="lastName"
              value={profile.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Passwort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Neues Passwort
          </label>
          <input
            type="password"
            name="password"
            value={profile.password || ""}
            onChange={(e) => onChange("password", e.target.value)}
            placeholder="Leer lassen, um Passwort beizubehalten"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
          />
          <p className="text-sm text-gray-600 mt-2">
            Mindestens 6 Zeichen. Leer lassen, wenn Sie Ihr Passwort nicht ändern
            möchten.
          </p>
        </div>
      </div>
    </div>
  );
}