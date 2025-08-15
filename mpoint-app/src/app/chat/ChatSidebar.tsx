"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type MatchItem = {
  id: string;
  partner?: { id?: string; name?: string };
};

export default function ChatSidebar({
  companyId,
  activeMatchId,
}: {
  companyId: string | null;
  activeMatchId?: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchMatches = () => {
      setLoading(true);
      fetch(`/api/matching/connected?userId=${session.user.id}`)
        .then((r) => r.json())
        .then((data) => {
          const list: MatchItem[] = (Array.isArray(data) ? data : []).map((m: any) => {
            const partner =
              companyId && m.senderCompany?.id === companyId
                ? m.receiverCompany
                : m.senderCompany;
            return {
              id: m.id,
              partner: { id: partner?.id, name: partner?.name },
            };
          });
          setMatches(list);
        })
        .finally(() => setLoading(false));
    };

    fetchMatches();
    const onUpdate = () => fetchMatches();
    window.addEventListener("matches-updated", onUpdate);
    window.addEventListener("matching-requests-updated", onUpdate);
    return () => {
      window.removeEventListener("matches-updated", onUpdate);
      window.removeEventListener("matching-requests-updated", onUpdate);
    };
  }, [session?.user?.id, companyId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return matches;
    return matches.filter((m) => (m.partner?.name || "").toLowerCase().includes(s));
  }, [matches, q]);

  const initials = (name?: string) =>
    (name || "?")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <aside className="h-full bg-white border border-gray-200 rounded-2xl p-3 flex flex-col">
      <div className="mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Unternehmen suchen…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60000]/20 focus:border-[#e60000]"
        />
      </div>

      {loading && <div className="text-sm text-gray-500 px-1 py-2">Lade Chats…</div>}
      {!loading && filtered.length === 0 && (
        <div className="text-sm text-gray-400 px-1 py-2">Keine Chats gefunden.</div>
      )}

      <ul className="space-y-1 overflow-y-auto">
        {filtered.map((m) => {
          const active = m.id === activeMatchId;
          return (
            <li key={m.id}>
              <button
                onClick={() => router.push(`/chat/${m.id}`)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition
                  ${active ? "bg-[#fff1f1] border border-[#ffd6d6]" : "hover:bg-gray-50"}`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold
                    ${active ? "bg-[#e60000] text-white" : "bg-gray-200 text-gray-700"}`}
                >
                  {initials(m.partner?.name)}
                </div>
                <div className="min-w-0">
                  <div className={`truncate text-sm ${active ? "text-[#b80000] font-semibold" : "text-gray-800 font-medium"}`}>
                    {m.partner?.name || "Unbekannt"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">Klicken zum Öffnen</div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}