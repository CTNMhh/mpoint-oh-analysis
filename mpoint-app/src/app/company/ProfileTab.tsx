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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mein Profil</h2>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Benutzername *</label>
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={(e) => onChange("username", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">@{profile.username}</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">E-Mail *</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Titel</label>
          <input
            type="text"
            name="titel"
            value={profile.titel || ""}
            onChange={(e) => onChange("titel", e.target.value)}
            placeholder="z.B. Dr., Prof."
            className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Anrede *</label>
          <select
            name="anrede"
            value={profile.anrede}
            onChange={(e) => onChange("anrede", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            required
          >
            <option value="">Bitte wählen</option>
            <option value="Herr">Herr</option>
            <option value="Frau">Frau</option>
            <option value="Divers">Divers</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Vorname *</label>
          <input
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nachname *</label>
          <input
            type="text"
            name="lastName"
            value={profile.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Neues Passwort</label>
        <input
          type="password"
          name="password"
          value={profile.password || ""}
          onChange={(e) => onChange("password", e.target.value)}
          placeholder="Leer lassen, um Passwort beizubehalten"
          className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
        />
        <p className="text-sm text-gray-600 mt-1">
          Mindestens 6 Zeichen. Leer lassen, wenn Sie Ihr Passwort nicht ändern
          möchten.
        </p>
      </div>
    </div>
  );
}