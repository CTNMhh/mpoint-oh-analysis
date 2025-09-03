import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Building2, Clock } from "lucide-react";
import Link from "next/link";

export default function OutgoingRequests() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchRequests = () => {
      setLoading(true);
      fetch(`/api/matching/requests/sent?userId=${session.user.id}`)
        .then(res => res.json())
        .then(setRequests)
        .finally(() => setLoading(false));
    };
    fetchRequests();
    window.addEventListener("matching-requests-updated", fetchRequests);
    return () => window.removeEventListener("matching-requests-updated", fetchRequests);
  }, [session?.user?.id]);

  if (!session?.user?.id) return null;

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          Offene Vernetzungsanfragen
        </h2>
        <Building2 className="w-6 h-6 text-[#e60000]" />
      </div>
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center py-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[rgb(228,25,31)]"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-gray-600">Keine offenen Anfragen.</div>
        ) : (
          <ul className="space-y-3">
            {requests.map(req => (
              <li
                key={req.id}
                className="flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all"
              >
                {req.receiverCompany?.id ? (
                  <Link
                    href={`/company/${req.receiverCompany.id}`}
                    className="flex items-center gap-2 group"
                    title="Unternehmensprofil öffnen"
                  >
                    <Building2 className="w-6 h-6 text-gray-400 group-hover:text-[#e60000] transition-colors" />
                    <span className="font-medium text-gray-900 group-hover:text-[#e60000] underline-offset-2 group-hover:underline">
                      {req.receiverCompany.name}
                    </span>
                  </Link>
                ) : (
                  <>
                    <Building2 className="w-6 h-6 text-gray-300" />
                    <span className="font-medium text-gray-500">Unbekanntes Unternehmen</span>
                  </>
                )}
                <span className="text-xs text-gray-500 ml-auto">
                  {req.status === "PENDING" && "Wartet auf Bestätigung"}
                  {req.status === "ACCEPTED_BY_SENDER" && "Wartet auf Partner"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}