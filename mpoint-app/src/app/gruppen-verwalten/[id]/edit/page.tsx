"use client";
import { useRouter } from "next/navigation";
import { useGroups, GroupProvider } from "@/context/GroupContext";
import { useState, useEffect, use } from "react"; // <--- use importieren

export default function GruppeEditPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = use(params); // <--- use statt React.use
  return (
    <GroupProvider>
      <GruppeEditForm params={resolvedParams} />
    </GroupProvider>
  );
}

function GruppeEditForm({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { groups, refreshGroups } = useGroups();
  const group = groups.find(g => g.id === params.id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [invitedUserIds, setInvitedUserIds] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(group?.avatarUrl || null);
  const [inviteQuery, setInviteQuery] = useState("");
  const [inviteResults, setInviteResults] = useState<{ id: string; firstName?: string; lastName?: string; email?: string }[]>([]);

  useEffect(() => {
    if (!group) {
      refreshGroups();
    } else {
      setName(group.name || "");
      setDescription(group.description || "");
      setAvatarPreview(group.avatarUrl || null);
    }
  }, [group, refreshGroups]);

  useEffect(() => {
    if (inviteQuery.trim().length < 2) {
      setInviteResults([]);
      return;
    }
    const fetchUsers = async () => {
      const res = await fetch(`/api/user?query=${encodeURIComponent(inviteQuery)}`);
      if (res.ok) {
        setInviteResults(await res.json());
      }
    };
    fetchUsers();
  }, [inviteQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Bitte einen Gruppennamen angeben.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let avatarUrl = group?.avatarUrl || "";
      if (avatar) {
        const formData = new FormData();
        formData.append("file", avatar);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          avatarUrl = data.url;
        }
      }
      await fetch(`/api/groups/${group?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, avatarUrl, invitedUserIds }),
      });
      await refreshGroups();
      router.push("/gruppen-verwalten");
    } catch (err) {
      setError("Fehler beim Bearbeiten der Gruppe.");
    } finally {
      setLoading(false);
    }
  };

  if (!group) return <div className="p-8">Gruppe nicht gefunden.</div>;

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-[#e60000]">Gruppe bearbeiten</h1>
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
          {/* Avatar Upload */}
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
                  setAvatarPreview(file ? URL.createObjectURL(file) : group?.avatarUrl || null);
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
          {/* Mitgliederliste */}
          <div
            id="members-list"
            className="mb-6">
            <label className="block font-semibold mb-2">Mitglieder</label>
            <ul className="space-y-1">
              {group.members
                .filter(member => member.status === "ACTIVE")
                .map(member => (
                  <li key={member.id} className="flex items-center gap-2">
                    <span>
                      {member.userId === group.adminId
                        ? <b>{displayName(member.user) || member.userId} (Admin)</b>
                        : displayName(member.user) || member.userId}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{member.status}</span>
                  </li>
                ))}
            </ul>
          </div>
          {/* Eingeladene User */}
          {(
            // Kombiniere eingeladene User aus DB (status INVITED) und neue aus invitedUserIds
            group.members.filter(member => member.status === "INVITED").length > 0 ||
            invitedUserIds.length > 0
          ) && (
            <div
                id="invited-users"
                className="mb-6">
                <label className="block font-semibold mb-2">Eingeladene Mitglieder</label>
              <ul className="space-y-1">
                {/* Bereits eingeladene User aus DB */}
                {group.members
                  .filter(member => member.status === "INVITED")
                  .map(member => (
                    <li key={member.id} className="flex items-center gap-2">
                      <span className="bg-yellow-100 px-2 py-1 rounded text-sm">
                        {displayName(member.user) || member.userId}
                      </span>
                      <span className="text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded">Eingeladen</span>
                      <button
                        type="button"
                        className="px-2 py-1 bg-[#e60000] text-white rounded hover:bg-red-700 text-xs font-semibold"
                        onClick={async () => {
                          await fetch("/api/groups/invite/resend", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              userId: member.userId,
                              groupId: group.id,
                            }),
                          });
                          // Optional: Feedback anzeigen
                        }}
                        title="Einladung erneut senden"
                      >
                        Einladung erneut senden
                      </button>
                    </li>
                  ))}
                {/* Neu eingeladene User aus invitedUserIds */}
                {invitedUserIds.map((userId, idx) => (
                  <li key={userId + idx} className="flex items-center gap-2">
                    <span className="bg-yellow-100 px-2 py-1 rounded text-sm">
                      {/* Optional: Namen aus inviteResults suchen */}
                      {inviteResults.find(u => u.id === userId)
                        ? displayName(inviteResults.find(u => u.id === userId))
                        : userId}
                    </span>
                    <span className="text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded">Eingeladen</span>
                    <button
                      type="button"
                      className="text-red-500 ml-1"
                      onClick={() => setInvitedUserIds(invitedUserIds.filter((_, i) => i !== idx))}
                      title="Entfernen"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* User einladen */}
          <div
            id="invite-user"
            className="mb-4">
            <label className="block font-semibold mb-1">User einladen (Suche nach Name oder E-Mail)</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              placeholder="Mind. 2 Zeichen eingeben..."
              disabled={loading}
              value={inviteQuery}
              onChange={e => setInviteQuery(e.target.value)}
            />
            {inviteResults.length > 0 && (
              <ul className="border rounded bg-white mt-2 shadow max-h-40 overflow-auto z-10">
                {inviteResults
                  .filter(user => user.id !== group.adminId) // Admin nicht anzeigen!
                  .map(user => (
                    <li
                      key={user.id}
                      className="px-3 py-2 cursor-pointer hover:bg-red-50 flex justify-between items-center"
                      onClick={() => {
                        setInvitedUserIds([...invitedUserIds, user.id]);
                        setInviteQuery("");
                        setInviteResults([]);
                      }}
                    >
                      <span>
                        {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">{user.email}</span>
                    </li>
                  ))}
              </ul>
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
              {loading ? "Speichern..." : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function displayName(user?: { firstName?: string; lastName?: string; name?: string }) {
  if (!user) return "";
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }
  return user.name || "";
}
