"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function MarketplaceDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const { data: session, status } = useSession();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Anfrage-Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [userRequest, setUserRequest] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function fetchEntry() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/marketplace/${id}`);
        if (!res.ok) {
          setNotFound(true);
          setEntry(null);
        } else {
          const data = await res.json();
          setEntry(data);
        }
      } catch {
        setNotFound(true);
        setEntry(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchEntry();
  }, [id]);

  // Hole die Anfrage des Nutzers für dieses Projekt
  useEffect(() => {
    async function fetchUserRequest() {
      if (!id || !session?.user?.id) return;
      try {
        const res = await fetch(`/api/marketplace/request?projectId=${id}`);
        const data = await res.json();
        setUserRequest(data.request);
      } catch {
        setUserRequest(null);
      }
    }
    if (status === "authenticated") fetchUserRequest();
  }, [id, session, status]);

  async function handleRequestSubmit() {
    setRequestLoading(true);
    setRequestError(null);
    setRequestSuccess(null);
    try {
      const method = userRequest ? "PATCH" : "POST";
      const res = await fetch("/api/marketplace/request", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: entry.id, message: requestMessage }),
      });
      if (res.ok) {
        setRequestSuccess(userRequest ? "Anfrage erfolgreich bearbeitet!" : "Anfrage erfolgreich gesendet!");
        setShowRequestModal(false);
        setRequestMessage("");
        // Reload userRequest
        const reqRes = await fetch(`/api/marketplace/request?projectId=${id}`);
        const reqData = await reqRes.json();
        setUserRequest(reqData.request);
      } else {
        const data = await res.json();
        setRequestError(data.error || "Fehler beim Senden der Anfrage.");
      }
    } catch (err) {
      setRequestError("Fehler beim Senden der Anfrage.");
    } finally {
      setRequestLoading(false);
    }
  }

  async function handleDeleteRequest() {
    setDeleteLoading(true);
    setRequestError(null);
    try {
      const res = await fetch("/api/marketplace/request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: entry.id }),
      });
      if (res.ok) {
        setShowRequestModal(false);
        setRequestMessage("");
        setUserRequest(null);
      } else {
        const data = await res.json();
        setRequestError(data.error || "Fehler beim Löschen der Anfrage.");
      }
    } catch {
      setRequestError("Fehler beim Löschen der Anfrage.");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto py-12 px-4 text-center text-gray-500">Lädt...</div>;
  }
  if (notFound || !entry) {
    return <div className="max-w-3xl mx-auto py-12 px-4 text-center text-red-500">Projekt nicht gefunden.</div>;
  }

  // Button: Bearbeiten oder Anfragen
  const requestButton = userRequest ? (
    <button className="px-5 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 hover:shadow transition-colors" onClick={() => { setShowRequestModal(true); setRequestMessage(userRequest.message || ""); }}>
      Bearbeiten
    </button>
  ) : (
    <button className="px-5 py-2 bg-[#e31e24] text-white rounded text-sm font-medium hover:bg-[#c01a1f] hover:shadow transition-colors" onClick={() => setShowRequestModal(true)}>
      Anfragen
    </button>
  );

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-primary text-2xl font-bold mb-4">Börse</h1>
        <h2 className="text-3xl font-bold text-primary mb-2">{entry.title}</h2>
        <div className="mb-4 text-sm text-gray-500">
          Kategorie: <span className="font-semibold">{entry.category}</span> | Typ: <span className="font-semibold">{entry.type}</span>
        </div>
        <div className="mb-6 text-gray-700">
          <span className="font-semibold">Kurzbeschreibung:</span> {entry.shortDescription}
        </div>
        <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: entry.longDescription || "<em>Keine Detailbeschreibung vorhanden.</em>" }} />
        <div className="text-sm text-gray-500 mb-2">Erstellt von: {entry.user?.firstName} {entry.user?.lastName}</div>
        <div className="flex justify-between items-center mt-6">
          <div className="font-semibold text-primary text-lg">
            {/* Preis anzeigen falls vorhanden */}
            {entry.price ? (
              entry.price.onRequest ? (
                "Auf Anfrage"
              ) : (
                `${entry.price.ab ? "ab " : ""}${entry.price.from != null ? entry.price.from.toLocaleString("de-DE") + "€" : ""}${
                    entry.price.to != null ? ` - ${entry.price.to.toLocaleString("de-DE")}€` : ""
                  }${entry.price.perHour ? "/Std" : ""}${entry.price.perDay ? "/Tag" : ""}${entry.price.perWeek ? "/Woche" : ""}${entry.price.perMonth ? "/Monat" : ""}`
              )
            ) : (
              "-"
            )}
          </div>
          {requestButton}
        </div>
      </div>
      {/* Anfrage Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">{userRequest ? "Anfrage bearbeiten" : "Projekt anfragen"}</h2>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={4}
              placeholder="Ihre Nachricht an den Anbieter..."
              value={requestMessage}
              onChange={e => setRequestMessage(e.target.value)}
              disabled={requestLoading || deleteLoading}
            />
            {requestError && <div className="text-red-600 text-sm mb-2">{requestError}</div>}
            {requestSuccess && <div className="text-green-600 text-sm mb-2">{requestSuccess}</div>}
            <div className="flex gap-3 justify-end">
              {userRequest && (
                <button className="px-5 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={handleDeleteRequest} disabled={deleteLoading || requestLoading}>Löschen</button>
              )}
              <button className="px-5 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => setShowRequestModal(false)} disabled={requestLoading || deleteLoading}>Abbrechen</button>
              <button className={`px-5 py-2 rounded ${userRequest ? "bg-blue-600 hover:bg-blue-700" : "bg-[#e31e24] hover:bg-[#c01a1f]"} text-white font-medium hover:shadow transition-colors`} onClick={handleRequestSubmit} disabled={requestLoading || deleteLoading || !requestMessage.trim()}>
                {userRequest ? "Speichern" : "Anfrage senden"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
