import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Building2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConnectedCompanies() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myCompanyId, setMyCompanyId] = useState<string | null>(null);
  const router = useRouter();

  // Eigene companyId über API laden (nicht aus Session)
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/company?userId=${session.user.id}`)
      .then((r) => r.json())
      .then((d) => {
        const id = Array.isArray(d) ? d[0]?.id : d?.id;
        setMyCompanyId(id ?? null);
      })
      .catch(() => setMyCompanyId(null));
  }, [session?.user?.id]);

  // Vernetzte Matches laden
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchMatches = () => {
      setLoading(true);
      fetch(`/api/matching/connected?userId=${session.user.id}`)
        .then((res) => res.json())
        .then(setMatches)
        .finally(() => setLoading(false));
    };

    fetchMatches();
    const onUpdate = () => fetchMatches();
    window.addEventListener("matching-requests-updated", onUpdate);
    window.addEventListener("matches-updated", onUpdate);
    return () => {
      window.removeEventListener("matching-requests-updated", onUpdate);
      window.removeEventListener("matches-updated", onUpdate);
    };
  }, [session?.user?.id]);

  if (!session?.user?.id) return null;

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          Vernetzte Unternehmen
        </h2>
        <Building2 className="w-6 h-6 text-[#e60000]" />
      </div>
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center py-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#e60000]"></div>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-gray-600">Noch keine Vernetzungen.</div>
        ) : !myCompanyId ? (
          <div className="text-gray-600">Kein Unternehmen für diesen User gefunden.</div>
        ) : (
          <ul className="space-y-3">
            {matches.map((match: any) => {
              const partnerCompany =
                match.senderCompany?.id === myCompanyId
                  ? match.receiverCompany
                  : match.senderCompany;
              const partnerUserId =
                match.senderUserId === session.user.id
                  ? match.receiverUserId
                  : match.senderUserId;
              return (
                <li
                  key={match.id}
                  className="flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all"
                >
                  <Building2 className="w-6 h-6 text-gray-400" />
                  <span className="font-medium">
                    {partnerCompany?.name || "Unbekanntes Unternehmen"}
                  </span>
                  <button
                    className="ml-auto flex items-center gap-1 text-[#e60000] hover:underline text-xs disabled:opacity-40"
                    onClick={() => partnerUserId && router.push(`/chat/${partnerUserId}`)}
                    disabled={!partnerUserId}
                    title="Chat öffnen"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
