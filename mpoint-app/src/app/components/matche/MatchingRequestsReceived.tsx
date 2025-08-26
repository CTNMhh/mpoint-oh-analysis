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
        .then((res) => res.json())
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
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          Erhaltene Vernetzungsanfragen
        </h2>
        <Building2 className="w-6 h-6 text-[#e60000]" />
      </div>
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center py-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#e60000]"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-gray-500">Keine Anfragen gefunden.</div>
        ) : (
          <ul className="space-y-3">
            {requests.map((req) => (
              <li
                key={req.id}
                className="flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all"
              >
                <Building2 className="w-6 h-6 text-gray-400" />
                <span className="font-medium">
                  {req.senderCompany?.name || "Unbekanntes Unternehmen"}
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  {req.status === "PENDING" && "Wartet auf Ihre Bestätigung"}
                  {req.status === "ACCEPTED_BY_RECEIVER" &&
                    "Sie haben bereits bestätigt"}
                </span>
                {req.status === "ACCEPTED_BY_SENDER" && (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/matching/accept`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              matchId: req.id,
                              userId: session.user.id,
                            }),
                          });
                          if (res.ok) {
                            setRequests((prev) =>
                              prev.filter((r) => r.id !== req.id)
                            );
                            window.dispatchEvent(
                              new Event("matching-requests-updated")
                            );
                            window.dispatchEvent(new Event("matches-updated"));
                          }
                        } catch {}
                      }}
                      className="ml-2 text-green-600 hover:underline text-xs"
                      title="Annehmen"
                    >
                      Annehmen
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/matching/accept`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ matchId: req.id }),
                          });
                          if (res.ok) {
                            setRequests((prev) =>
                              prev.filter((r) => r.id !== req.id)
                            );
                            window.dispatchEvent(
                              new Event("matching-requests-updated")
                            );
                          }
                        } catch {}
                      }}
                      className="ml-2 text-red-600 hover:underline text-xs"
                      title="Ablehnen"
                    >
                      Ablehnen
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
