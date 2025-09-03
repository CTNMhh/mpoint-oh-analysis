"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

// Status-Badge Styles und Labels für Nutzer-Anfragen (konsistent zur Listenansicht)
const requestStatusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  DECLINED: "bg-red-50 text-red-700 border-red-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  ACCEPTED: "bg-green-50 text-green-700 border-green-200",
  CONFIRMED: "bg-green-50 text-green-700 border-green-200",
  CANCELED: "bg-gray-50 text-gray-700 border-gray-200",
  CANCELLED: "bg-gray-50 text-gray-700 border-gray-200",
};

function requestStatusLabel(status?: string): string {
  const map: Record<string, string> = {
    PENDING: "Offen",
    DECLINED: "Abgelehnt",
    APPROVED: "Angenommen",
    ACCEPTED: "Angenommen",
    CONFIRMED: "Bestätigt",
    CANCELED: "Storniert",
    CANCELLED: "Storniert",
  };
  if (!status) return "Gesendet";
  return map[status] || status;
}

export default function MarketplaceDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const { data: session, status } = useSession();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Anfrage-Panel (statt Modal) State
  const [showRequestPanel, setShowRequestPanel] = useState(false);
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
  setShowRequestPanel(false);
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
  setShowRequestPanel(false);
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
    return (
      <div className="bg-gray-50 min-h-screen">
        <main className="max-w-3xl mx-auto pt-20 pb-10 px-4 text-center text-gray-500">Lädt...</main>
      </div>
    );
  }
  if (notFound || !entry) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <main className="max-w-3xl mx-auto pt-20 pb-10 px-4 text-center text-red-500">Projekt nicht gefunden.</main>
      </div>
    );
  }

  // Button: Bearbeiten oder Anfragen
  const statusBadge = userRequest ? (
    <span
      className={`border text-xs font-medium px-2.5 py-1 rounded-full ${
        requestStatusStyles[userRequest.status] ||
        "bg-blue-50 text-blue-700 border-blue-200"
      }`}
      title={`Status deiner Anfrage: ${requestStatusLabel(userRequest.status)}`}
    >
      {requestStatusLabel(userRequest.status)}
    </span>
  ) : null;
  const requestButton = userRequest ? (
    <button
      className="px-5 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 hover:shadow transition-colors"
      onClick={() => {
        setShowRequestPanel((open) => !open);
        setRequestMessage(userRequest.message || "");
      }}
    >
      {showRequestPanel ? "Schließen" : "Bearbeiten"}
    </button>
  ) : (
    <button
      className="px-5 py-2 bg-[#e31e24] text-white rounded text-sm font-medium hover:bg-[#c01a1f] hover:shadow transition-colors"
      onClick={() => setShowRequestPanel((open) => !open)}
    >
      {showRequestPanel ? "Schließen" : "Anfragen"}
    </button>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-3xl mx-auto pt-20 pb-10 px-4 mb-6 mt-6">
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
        {!entry.anonym && (
          <div className="text-sm text-gray-500 mb-2">
            Anbieter: {entry.company?.name || entry.user?.company?.[0]?.name || `${entry.user?.firstName ?? ""} ${entry.user?.lastName ?? ""}`.trim()}
          </div>
        )}
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
          <div className="flex items-center gap-2">
            {statusBadge}
            {requestButton}
          </div>
        </div>
        {/* Inline Anfrage Panel */}
        {showRequestPanel && (
          <div className="mt-6 pt-6">
            <h2 className="text-lg font-bold mb-4">{userRequest ? "Anfrage bearbeiten" : "Projekt anfragen"}</h2>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={4}
              placeholder="Ihre Nachricht an den Anbieter..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              disabled={requestLoading || deleteLoading}
            />
            {requestError && <div className="text-red-600 text-sm mb-2">{requestError}</div>}
            {requestSuccess && <div className="text-green-600 text-sm mb-2">{requestSuccess}</div>}
            <div className="flex gap-3 justify-end">
              {userRequest && (
                <button
                  className="px-5 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={handleDeleteRequest}
                  disabled={deleteLoading || requestLoading}
                >
                  Löschen
                </button>
              )}
              <button
                className="px-5 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setShowRequestPanel(false)}
                disabled={requestLoading || deleteLoading}
              >
                Abbrechen
              </button>
              <button
                className={`px-5 py-2 rounded ${userRequest ? "bg-red-600 hover:bg-red-700" : "bg-[#e31e24] hover:bg-[#c01a1f]"} text-white font-medium hover:shadow transition-colors`}
                onClick={handleRequestSubmit}
                disabled={requestLoading || deleteLoading || !requestMessage.trim()}
              >
                {userRequest ? "Speichern" : "Anfrage senden"}
              </button>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
