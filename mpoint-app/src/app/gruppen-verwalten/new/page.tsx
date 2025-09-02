"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGroups, GroupProvider } from "@/context/GroupContext";

export default function GruppeAnlegenPage() {
  return (
    <GroupProvider>
      <GruppeAnlegenForm />
    </GroupProvider>
  );
}

function GruppeAnlegenForm() {
  const router = useRouter();
  const { createGroup } = useGroups();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Bitte einen Gruppennamen angeben.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let avatarUrl = "";
      if (avatar) {
        const formData = new FormData();
        formData.append("file", avatar);
        // Beispiel-API für Bild-Upload
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          avatarUrl = data.url;
        }
      }
      // avatarUrl bleibt leer, wenn kein Bild gewählt wurde
      const group = await createGroup({ name, description, avatarUrl });
      router.push("/gruppen-verwalten");

      // Angenommen, du bekommst ein Array invitedUserIds
      if (invitedUserIds && invitedUserIds.length > 0) {
        await prisma.groupMember.createMany({
          data: invitedUserIds.map(userId => ({
            groupId: group.id,
            userId,
            status: "INVITED",
            invitedById: session.user.id,
          })),
        });
        // Sende Notification an jeden eingeladenen User
        for (const userId of invitedUserIds) {
          await prisma.notification.create({
            data: {
              userId,
              type: "MESSAGE", // oder ein eigener Typ wie "GROUP_INVITE"
              title: `Einladung zur Gruppe "${group.name}"`,
              body: `Du wurdest von ${session.user.username} eingeladen. Jetzt annehmen oder ablehnen.`,
              url: `/gruppen/${group.id}`,
            },
          });
        }
      }
    } catch (err) {
      setError("Fehler beim Erstellen der Gruppe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-[#e60000]">Neue Gruppe anlegen</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Gruppenname</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Beschreibung (optional)</label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Avatar / Bild</label>
            <label className="w-full flex flex-col items-center cursor-pointer">
              <span className="inline-block px-4 py-2 bg-[#e60000] text-white rounded font-semibold hover:bg-red-700 transition mb-2">
                Bild auswählen
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={loading}
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  setAvatar(file);
                  setAvatarPreview(file ? URL.createObjectURL(file) : null);
                }}
              />
            </label>
            {avatarPreview && (
              <div className="mt-4 flex flex-col items-center border-2 border-[#e60000] rounded-xl p-4 bg-red-50">
                <span className="text-base text-[#e60000] mb-2 font-bold">Avatar Vorschau</span>
                <img
                  src={avatarPreview}
                  alt="Avatar Vorschau"
                  className="w-24 h-24 object-cover rounded-full border-2 border-[#e60000] shadow"
                />
              </div>
            )}
          </div>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={() => router.push("/gruppen-verwalten")}
              disabled={loading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#e60000] text-white rounded font-semibold hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Wird angelegt..." : "Gruppe anlegen"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}