import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Building2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConnectedCompanies() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    fetch(`/api/matching/connected?userId=${session.user.id}`)
      .then(res => res.json())
      .then(setMatches)
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  if (!session?.user?.id) return null;
  if (loading) return <div>Lade vernetzte Unternehmen...</div>;
  if (matches.length === 0) return <div className="text-gray-400 text-sm">Noch keine Vernetzungen.</div>;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-[#e60000]" />
        Vernetzte Unternehmen
      </h2>
      <ul className="space-y-3">
        {matches.map(match => {
          // Das jeweils andere Unternehmen bestimmen
          const myCompanyId = session.user.companyId;
          const company = match.senderCompany?.id === myCompanyId
            ? match.receiverCompany
            : match.senderCompany;
          return (
            <li key={match.id} className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-gray-400" />
              <span className="font-medium">{company?.name || "Unbekanntes Unternehmen"}</span>
              <button
                className="ml-auto flex items-center gap-1 text-[#e60000] hover:underline text-xs"
                onClick={() => router.push(`/chat/${company?.id}`)}
                title="Chat starten"
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}