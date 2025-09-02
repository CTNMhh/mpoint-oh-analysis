import React, { useState, useEffect } from "react";

// window.showMessageModal als optionales Property deklarieren
declare global {
  interface Window {
    showMessageModal?: boolean;
  }
}
import { Pencil, MessageCircle, MessageCircleQuestionMark, X } from "lucide-react";
import { useRouter } from "next/navigation";

// Typen und Hilfsfunktionen aus page.tsx
export type PriceType = {
  from?: number;
  to?: number;
  ab?: boolean;
  perHour?: boolean;
  perWeek?: boolean;
  perMonth?: boolean;
  perDay?: boolean;
  onRequest?: boolean;
};

export function priceDataToString(price: PriceType): string {
  if (price.onRequest) return "Auf Anfrage";
  if (price.from == null && price.to == null) return "-";
  let out = "";
  if (price.ab) out += "ab ";
  if (price.from != null) out += price.from.toLocaleString("de-DE") + "€";
  if (price.to != null) out += ` - ${price.to.toLocaleString("de-DE")}€`;
  if (price.perHour) out += "/Std";
  if (price.perDay) out += "/Tag";
  if (price.perWeek) out += "/Woche";
  if (price.perMonth) out += "/Monat";
  return out.trim();
}

const categoryColorClasses: Record<string, string> = {
  "DIENSTLEISTUNG": "bg-blue-50 text-blue-700",
  "PRODUKT": "bg-violet-50 text-violet-700",
  "DIGITALISIERUNG": "bg-green-50 text-green-700",
  "NACHHALTIGKEIT": "bg-green-50 text-green-700",
  "MANAGEMENT": "bg-blue-50 text-blue-700",
};

const typeColors: Record<string, string> = {
  "Anfrage": "bg-yellow-50 text-yellow-700",
  "Angebot": "bg-blue-50 text-blue-700",
};

// Freundliche deutsche Status-Labels
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

function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  if (diff < hour) {
    const mins = Math.max(1, Math.floor(diff / minute));
    return `vor ${mins} Minute${mins === 1 ? '' : 'n'}`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `vor ${hours} Stunde${hours === 1 ? '' : 'n'}`;
  } else if (diff < week) {
    const days = Math.floor(diff / day);
    return `vor ${days} Tag${days === 1 ? '' : 'en'}`;
  } else if (diff < month) {
    const weeks = Math.floor(diff / week);
    return `vor ${weeks} Woche${weeks === 1 ? '' : 'n'}`;
  } else if (diff < year) {
    const months = Math.floor(diff / month);
    return `vor ${months} Monat${months === 1 ? '' : 'en'}`;
  } else {
    const years = Math.floor(diff / year);
    return `vor ${years} Jahr${years === 1 ? '' : 'en'}`;
  }
}

const userCache: Record<string, string> = {};

async function getUserNameById(userId: string): Promise<string> {
  if (userCache[userId]) return userCache[userId];
  try {
    const res = await fetch(`/api/user/${userId}`);
    if (!res.ok) throw new Error("User not found");
    const { titel, firstName, lastName } = await res.json();
    const name = [titel, firstName, lastName].filter(Boolean).join(" ");
    userCache[userId] = name;
    return name;
  } catch (err) {
    console.error(`Fehler beim Laden von Benutzer ${userId}:`, err);
    return "Unbekannter Nutzer";
  }
}

interface Props {
  session: any;
  entries: any[];
  userRequests: Record<string, any>;
  setEntries: (fn: (prev: any[]) => any[]) => void;
  setUserRequests: (fn: (prev: Record<string, any>) => Record<string, any>) => void;
  editProjectModal?: React.ReactNode;
  onEditProject?: (project: any) => void;
  onEditRequest?: (project: any) => void;
}

const MarketplaceUserCard: React.FC<Props> = ({ session, entries, userRequests, setEntries, setUserRequests }) => {
  const router = useRouter();
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [requestedProjects, setRequestedProjects] = useState<any[]>([]);
  // Anzahl PENDING-Anfragen pro Projekt (für Badge)
  const [projectRequestCounts, setProjectRequestCounts] = useState<Record<string, number>>({});
  // Gesamtanzahl Anfragen pro Projekt (für Icon-Farbe/Klickbarkeit)
  const [projectTotalRequestCounts, setProjectTotalRequestCounts] = useState<Record<string, number>>({});
  // Inline Edit für eigene Anfrage (statt Modal)
  const [editDrafts, setEditDrafts] = useState<Record<string, string>>({});
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  // Aufklapper-Zustände trennen: links (Nachrichtenliste) vs. rechts (eigene Anfrage bearbeiten)
  const [expandedProjectMessages, setExpandedProjectMessages] = useState<Record<string, boolean>>({});
  const [projectRequests, setProjectRequests] = useState<Record<string, any[]>>({});
  const [expandedEditRequests, setExpandedEditRequests] = useState<Record<string, boolean>>({});

  // --- Preis-Eingabe State für Modal ---
  const [priceInput, setPriceInput] = useState<PriceType>({});
  const [priceMode, setPriceMode] = useState<string>("fixed");

  // Preis-Eingabe-Handler
  const handlePriceChange = (field: keyof PriceType, value: any) => {
    setPriceInput(prev => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    if (!session?.user?.id) {
      setMyProjects([]);
      setRequestedProjects([]);
      return;
    }
    setMyProjects(entries.filter(entry => entry.userId === session.user.id));
    const requestedIds = Object.keys(userRequests);
    setRequestedProjects(entries.filter(entry => requestedIds.includes(entry.id)));
  }, [entries, userRequests, session]);

  useEffect(() => {
    async function fetchRequestCounts() {
      if (!myProjects.length) return;
      const pendingCounts: Record<string, number> = {};
      const totalCounts: Record<string, number> = {};
      await Promise.all(
        myProjects.map(async (entry) => {
          try {
            // PENDING Count für Badge
            const resPending = await fetch(
              `/api/marketplace/request?countRequestId=${entry.id}&status=PENDING`
            );
            const dataPending = await resPending.json();
            pendingCounts[entry.id] = dataPending.count ?? 0;
          } catch {
            pendingCounts[entry.id] = 0;
          }
          try {
            // Gesamtcount für Icon-Farbe/Klickbarkeit
            const resTotal = await fetch(
              `/api/marketplace/request?countRequestId=${entry.id}`
            );
            const dataTotal = await resTotal.json();
            totalCounts[entry.id] = dataTotal.count ?? 0;
          } catch {
            totalCounts[entry.id] = 0;
          }
        })
      );
      setProjectRequestCounts(pendingCounts);
      setProjectTotalRequestCounts(totalCounts);
    }
    fetchRequestCounts();
  }, [myProjects]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch("/api/marketplace");
        const data = await res.json();
        setEntries(() => data);
        // Hole alle User-Requests für die Einträge
        if (session?.user?.id) {
          const requests: Record<string, any> = {};
          await Promise.all(data.map(async (entry: any) => {
            try {
              const resReq = await fetch(`/api/marketplace/request?projectId=${entry.id}`);
              const dataReq = await resReq.json();
              if (dataReq.request) requests[entry.id] = dataReq.request;
            } catch {}
          }));
          setUserRequests(() => requests);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Börsendaten:", err);
      }
    };
    fetchEntries();
  }, [session]);

  async function handleRemoveProject(projectId: string) {
    if (!window.confirm("Projekt wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/marketplace/${projectId}`, { method: "DELETE" });
      if (res.ok) {
        setEntries(prev => prev.filter((e: any) => e.id !== projectId));
      } else {
        alert("Fehler beim Löschen des Projekts.");
      }
    } catch {
      alert("Fehler beim Löschen des Projekts.");
    }
  }

  async function handleRemoveRequest(projectId: string) {
    if (!window.confirm("Anfrage wirklich löschen?")) return;
    try {
      const res = await fetch("/api/marketplace/request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (res.ok) {
        setUserRequests(prev => {
          const copy = { ...prev };
          delete copy[projectId];
          return copy;
        });
      } else {
        alert("Fehler beim Löschen der Anfrage.");
      }
    } catch {
      alert("Fehler beim Löschen der Anfrage.");
    }
  }

  // Handler zum Absenden (Bearbeiten der eigenen Anfrage)
  async function handleRequestSubmit(projectId: string, msg: string) {
    setRequestLoading(true);
    setRequestError(null);
    setRequestSuccess(null);
    try {
      const res = await fetch("/api/marketplace/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, message: msg }),
      });
      if (res.ok) {
        setRequestSuccess("Anfrage gespeichert.");
        setUserRequests(prev => ({ ...prev, [projectId]: { ...prev[projectId], message: msg } }));
        setEditDrafts(prev => ({ ...prev, [projectId]: msg }));
      } else {
        const err = await res.json();
        setRequestError(err.error || "Fehler beim Speichern.");
      }
    } catch {
      setRequestError("Fehler beim Speichern.");
    } finally {
      setRequestLoading(false);
    }
  }

  // Handler zum Löschen der eigenen Anfrage
  async function handleDeleteRequest(projectId: string) {
    setRequestLoading(true);
    setRequestError(null);
    setRequestSuccess(null);
    try {
      const res = await fetch("/api/marketplace/request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (res.ok) {
        setUserRequests(prev => {
          const copy = { ...prev };
          delete copy[projectId];
          return copy;
        });
        setEditDrafts(prev => ({ ...prev, [projectId]: "" }));
      } else {
        setRequestError("Fehler beim Löschen der Anfrage.");
      }
    } catch {
      setRequestError("Fehler beim Löschen der Anfrage.");
    } finally {
      setRequestLoading(false);
    }
  }

  // Nachrichten aufklappen und laden
  async function toggleMessages(entry: any) {
    setExpandedProjectMessages(prev => ({ ...prev, [entry.id]: !prev[entry.id] }));
    const isOpening = !expandedProjectMessages[entry.id];
    if (isOpening && !projectRequests[entry.id]) {
      try {
        const res = await fetch(`/api/marketplace/request?projectId=${entry.id}&list=1`);
        if (res.ok) {
          const data = await res.json();
          let reqs: any[] = [];
          if (Array.isArray(data.requests)) {
            reqs = data.requests;
          } else if (data.request) {
            reqs = Array.isArray(data.request) ? data.request : [data.request];
          }
          const enriched = await Promise.all(reqs.map(async (r: any) => {
            if (!r.userName && r.userId) {
              const name = await getUserNameById(r.userId);
              return { ...r, userName: name };
            }
            return r;
          }));
          setProjectRequests(prev => ({ ...prev, [entry.id]: enriched }));
        } else {
          setProjectRequests(prev => ({ ...prev, [entry.id]: [] }));
        }
      } catch {
        setProjectRequests(prev => ({ ...prev, [entry.id]: [] }));
      }
    }
  }

  // Counts für ein einzelnes Projekt aktualisieren (pending + total)
  async function refreshCountsForProject(projectId: string) {
    try {
      const [resPending, resTotal] = await Promise.all([
        fetch(`/api/marketplace/request?countRequestId=${projectId}&status=PENDING`),
        fetch(`/api/marketplace/request?countRequestId=${projectId}`),
      ]);
      const dataPending = await resPending.json();
      const dataTotal = await resTotal.json();
      setProjectRequestCounts(prev => ({ ...prev, [projectId]: dataPending.count ?? 0 }));
      setProjectTotalRequestCounts(prev => ({ ...prev, [projectId]: dataTotal.count ?? 0 }));
    } catch {
      // ignore
    }
  }

  // Anfrage ablehnen
  async function handleRejectRequest(requestId: string, projectId: string) {
    try {
      const res = await fetch("/api/marketplace/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status: "DECLINED" }),
      });
      if (res.ok) {
        setProjectRequests(prev => ({
          ...prev,
          [projectId]: (prev[projectId] || []).map(r => r.id === requestId ? { ...r, status: "DECLINED" } : r)
        }));
        refreshCountsForProject(projectId);
      }
    } catch {}
  }

  // Preis-Modus-Handler
  const handlePriceModeChange = (mode: string) => {
    setPriceMode(mode);
    // Setze Preisobjekt je nach Modus
    if (mode === "onRequest") {
      setPriceInput({ onRequest: true });
    } else if (mode === "fixed") {
      setPriceInput({});
    } else if (mode === "ab") {
      setPriceInput({ ab: true });
    } else if (mode === "perHour") {
      setPriceInput({ perHour: true });
    } else if (mode === "perWeek") {
      setPriceInput({ perWeek: true });
    } else if (mode === "perMonth") {
      setPriceInput({ perMonth: true });
    } else if (mode === "range") {
      setPriceInput({});
    } else {
      setPriceInput({});
    }
  };

  // Create/Edit Form ist jetzt eigene Seite – kein Modal mehr

  return (
    <div className="bg-white rounded-lg shadow-sm mb-8 p-6 flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Meine Projekte</h2>
        <div className="mb-5">
          <button
            className="bg-[#e60000] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#c01a1f] transition-colors shadow  cursor-pointer"
            onClick={() => router.push("/boerse/new")}
          >
            Eigenes Projekt einstellen
          </button>
        </div>
        {/* Project Bar */}
        {myProjects.length === 0 ? (
          <div className="text-gray-600">Keine eigenen Projekte.</div>
        ) : (
          <ul className="space-y-2">
            {myProjects.map(entry => (
              <li key={entry.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-2">
                  <a href={`/boerse/${entry.id}`} className="text-primary hover:underline font-medium">{entry.title}</a>
                  <div className="flex items-center gap-1 relative">
                    <button
                      className={`relative text-lg px-2 cursor-pointer ${((projectTotalRequestCounts[entry.id] ?? 0) > 0) ? 'text-blue-600 hover:text-blue-700' : 'text-gray-300 cursor-not-allowed'}`}
                      title="Anfragen anzeigen"
                      onClick={e => {
                        e.preventDefault();
                        const total = projectTotalRequestCounts[entry.id] ?? 0;
                        if (total > 0) {
                          toggleMessages(entry);
                        }
                      }}
                    >
                      <MessageCircleQuestionMark className="w-5 h-5" />
                      {typeof projectRequestCounts[entry.id] === 'number' && projectRequestCounts[entry.id] > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#e60000] text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold">
                          {projectRequestCounts[entry.id]}
                        </span>
                      )}
                    </button>
                    <button
                      className="text-gray-600 hover:text-blue-600 text-lg px-2 cursor-pointer"
                      title="Projekt bearbeiten"
                      onClick={e => { e.preventDefault(); router.push(`/boerse/${entry.id}/edit`); }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="text-[#e60000] hover:text-[#c01a1f] text-lg px-2 cursor-pointer"
                      title="Projekt entfernen"
                      onClick={e => { e.preventDefault(); handleRemoveProject(entry.id); }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Aufklapper: Anfragenliste */}
                {expandedProjectMessages[entry.id] && (
                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Anfragen</h4>
                    {(projectRequests[entry.id] ?? []).length === 0 ? (
                      <div className="text-sm text-gray-600">Keine Anfragen vorhanden.</div>
                    ) : (
                      <ul className="space-y-2">
                        {(projectRequests[entry.id] ?? [])
                          // Abgelehnte nach unten sortieren
                          .slice()
                          .sort((a: any, b: any) => {
                            const aDecl = a.status === 'DECLINED';
                            const bDecl = b.status === 'DECLINED';
                            if (aDecl && !bDecl) return 1;
                            if (!aDecl && bDecl) return -1;
                            return 0;
                          })
                          .map((r: any) => (
                          <li key={r.id} className="p-3 border border-gray-200 rounded-lg bg-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-gray-900">{r.userName || r.userId}</span>
                                <span className={`border text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                  r.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  r.status === 'DECLINED' ? 'bg-red-50 text-red-700 border-red-200' :
                                  (r.status === 'CANCELED' || r.status === 'CANCELLED') ? 'bg-gray-50 text-gray-700 border-gray-200' :
                                  'bg-green-50 text-green-700 border-green-200'
                                }`}>
                                  {requestStatusLabel(r.status)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {r.status === 'PENDING' && (
                                  <button
                                    className="text-xs px-3 py-1 rounded-xl bg-white border border-gray-300 hover:border-red-300 hover:text-red-700 cursor-pointer"
                                    onClick={(e) => { e.preventDefault(); handleRejectRequest(r.id, entry.id); }}
                                  >
                                    Ablehnen
                                  </button>
                                )}
                                {(() => {
                                  const isSelf = session?.user?.id && r?.userId && session.user.id === r.userId;
                                  const chatHref = `/chat/${encodeURIComponent(r.userId)}?projectId=${encodeURIComponent(entry.id)}`;
                                  return (
                                    <button
                                      className={`text-xs px-3 py-1 rounded-xl bg-white border inline-flex items-center justify-center ${
                                        isSelf
                                          ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-300'
                                          : 'border-gray-300 hover:border-gray-400 cursor-pointer'
                                      }`}
                                      title={isSelf ? 'Eigene Anfrage – Chat deaktiviert' : 'Chat starten'}
                                      aria-label={isSelf ? 'Chat deaktiviert' : 'Chat starten'}
                                      aria-disabled={isSelf ? true : undefined}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (isSelf) return;
                                        router.push(chatHref);
                                      }}
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </button>
                                  );
                                })()}
                              </div>
                            </div>
                            {r.message && (
                              <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{r.message}</p>
                            )}
                            <div className="text-xs text-gray-500 mt-2">{r.createdAt ? timeAgo(new Date(r.createdAt).getTime()) : ''}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Angefragte Projekte</h2>
        {requestedProjects.length === 0 ? (
          <div className="text-gray-600">Keine Anfragen gestellt.</div>
        ) : (
          <ul className="space-y-2">
            {requestedProjects.map(entry => (
              <li key={entry.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-2">
                  <a href={`/boerse/${entry.id}`} className="text-primary hover:underline font-medium">{entry.title}</a>
                  <div className="flex items-center gap-1">
          <button
                      className="text-gray-600 hover:text-blue-600 text-lg px-2 cursor-pointer"
                      title="Anfrage bearbeiten"
                      onClick={e => {
                        e.preventDefault();
                        setEditDrafts(prev => ({ ...prev, [entry.id]: prev[entry.id] ?? (userRequests[entry.id]?.message || '') }));
            // Nur den rechten Aufklapper togglen
            setExpandedEditRequests(prev => ({ ...prev, [entry.id]: !prev[entry.id] }));
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="text-[#e60000] hover:text-[#c01a1f] text-lg px-2 cursor-pointer"
                      title="Anfrage entfernen"
                      onClick={e => { e.preventDefault(); handleRemoveRequest(entry.id); }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Aufklapper: Anfrage bearbeiten */}
                {expandedEditRequests[entry.id] && (
                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Eigene Nachricht</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      rows={3}
                      value={editDrafts[entry.id] ?? ""}
                      onChange={(e) => setEditDrafts(prev => ({ ...prev, [entry.id]: e.target.value }))}
                      placeholder="Nachricht aktualisieren..."
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        className="px-4 py-2 rounded-xl bg-white border border-gray-300 hover:border-gray-400 cursor-pointer"
                        onClick={(e) => { e.preventDefault(); setExpandedEditRequests(prev => ({ ...prev, [entry.id]: false })); }}
                      >
                        Schließen
                      </button>
                      <button
                        className="px-4 py-2 rounded-xl bg-[#e60000] text-white hover:bg-[#c01a1f] cursor-pointer"
                        onClick={(e) => { e.preventDefault(); handleRequestSubmit(entry.id, (editDrafts[entry.id] || '').trim()); }}
                        disabled={requestLoading || !(editDrafts[entry.id] || '').trim()}
                      >
                        Speichern
                      </button>
                    </div>
                    {requestError && <div className="text-sm text-red-600 mt-2">{requestError}</div>}
                    {requestSuccess && <div className="text-sm text-green-600 mt-2">{requestSuccess}</div>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MarketplaceUserCard;
