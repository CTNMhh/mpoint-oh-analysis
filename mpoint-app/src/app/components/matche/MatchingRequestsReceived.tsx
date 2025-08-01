import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Building2 } from "lucide-react";

export default function IncomingRequests() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchRequests = () => {
      setLoading(true);
      fetch(`/api/matching/requests/received?userId=${session.user.id}`)
        .then(res => res.json())
        .then(setRequests)
        .finally(() => setLoading(false));
    };
    fetchRequests();
    window.addEventListener("matching-requests-updated", fetchRequests);
    return () => window.removeEventListener("matching-requests-updated", fetchRequests);
  }, [session?.user?.id]);

  if (!session?.user?.id) return null;
  if (loading) return <div>Lade Anfragen...</div>;
  if (requests.length === 0) return <div className="text-gray-400 text-sm">Keine neuen Anfragen.</div>;
  console.log("Received requests:", requests);
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-[#e60000]" />
        Erhaltene Vernetzungsanfragen
      </h2>
      <ul className="space-y-3">
        {requests.map(req => (
          <li key={req.id} className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-gray-400" />
            <span className="font-medium">{req.senderCompany?.name || "Unbekanntes Unternehmen"}</span>
            <span className="text-xs text-gray-500 ml-auto">
              {req.status === "PENDING" && "Wartet auf Ihre Bestätigung"}
              {req.status === "ACCEPTED_BY_RECEIVER" && "Sie haben bereits bestätigt"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}