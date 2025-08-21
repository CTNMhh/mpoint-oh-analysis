import React, { useState, useEffect } from "react";
import EditRequestModal from "./EditRequestModal";

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

const MarketplaceUserCard: React.FC<Props> = ({ session, entries, userRequests, setEntries, setUserRequests, editProjectModal, onEditProject, onEditRequest }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProject, setEditProject] = useState<any>(null);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [requestedProjects, setRequestedProjects] = useState<any[]>([]);
  const [projectRequestCounts, setProjectRequestCounts] = useState<Record<string, number>>({});
  // State für Anfrage-Bearbeiten-Modal
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [editRequestEntry, setEditRequestEntry] = useState<any>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

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
      const counts: Record<string, number> = {};
      await Promise.all(myProjects.map(async (entry) => {
        try {
          const res = await fetch(`/api/marketplace/request?countRequestId=${entry.id}`);
          const data = await res.json();
          counts[entry.id] = data.count ?? 0;
        } catch {
          counts[entry.id] = 0;
        }
      }));
      setProjectRequestCounts(counts);
    }
    fetchRequestCounts();
  }, [myProjects]);

  async function handleRemoveProject(projectId: string) {
    if (!window.confirm("Projekt wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/marketplace/${projectId}`, { method: "DELETE" });
      if (res.ok) {
        setEntries(prev => prev.filter(e => e.id !== projectId));
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

  // Handler zum Öffnen des Modals
  function handleEditRequest(entry: any) {
    setEditRequestEntry(entry);
    setRequestMessage(userRequests[entry.id]?.message || "");
    setShowEditRequestModal(true);
    setRequestError(null);
    setRequestSuccess(null);
  }

  // Handler zum Absenden
  async function handleRequestSubmit(msg: string) {
    setRequestLoading(true);
    setRequestError(null);
    setRequestSuccess(null);
    try {
      const res = await fetch("/api/marketplace/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: editRequestEntry.id, message: msg }),
      });
      if (res.ok) {
        setRequestSuccess("Anfrage gespeichert.");
        setUserRequests(prev => ({ ...prev, [editRequestEntry.id]: { ...prev[editRequestEntry.id], message: msg } }));
        setShowEditRequestModal(false);
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

  // Handler zum Löschen
  async function handleDeleteRequest() {
    setRequestLoading(true);
    setRequestError(null);
    setRequestSuccess(null);
    try {
      const res = await fetch("/api/marketplace/request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: editRequestEntry.id }),
      });
      if (res.ok) {
        setUserRequests(prev => {
          const copy = { ...prev };
          delete copy[editRequestEntry.id];
          return copy;
        });
        setShowEditRequestModal(false);
      } else {
        setRequestError("Fehler beim Löschen der Anfrage.");
      }
    } catch {
      setRequestError("Fehler beim Löschen der Anfrage.");
    } finally {
      setRequestLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm mb-8 p-6 flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <h2 className="text-lg font-bold mb-3">Meine Projekte</h2>
        {myProjects.length === 0 ? (
          <div className="text-gray-500 text-sm">Keine eigenen Projekte.</div>
        ) : (
          <ul className="space-y-2">
            {myProjects.map(entry => (
              <li key={entry.id} className="flex items-center justify-between gap-2">
                <a href={`/boerse/${entry.id}`} className="text-primary hover:underline font-medium">{entry.title}</a>
                <div className="flex items-center gap-1 relative">
                  <button
                    className="relative text-gray-500 hover:text-primary text-lg px-2"
                    title="Mitteilungen"
                    onClick={e => { e.preventDefault(); /* TODO: Mitteilungsfunktion */ }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3.5h6m-6 3.5h3.75M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 0 1-4.5-1.07L3 21l1.07-4.5A8.96 8.96 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
                    </svg>
                    {typeof projectRequestCounts[entry.id] === 'number' && projectRequestCounts[entry.id] > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold">
                        {projectRequestCounts[entry.id]}
                      </span>
                    )}
                  </button>
                  <button
                    className="text-gray-500 hover:text-blue-600 text-lg px-2"
                    title="Projekt bearbeiten"
                    onClick={e => { e.preventDefault(); onEditProject ? onEditProject(entry) : (setEditProject(entry), setShowEditModal(true)); }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M17.414 2.586a2 2 0 0 0-2.828 0l-9.5 9.5A2 2 0 0 0 4 13.5V16a1 1 0 0 0 1 1h2.5a2 2 0 0 0 1.414-.586l9.5-9.5a2 2 0 0 0 0-2.828l-2.5-2.5ZM15 4l2 2-9.5 9.5a1 1 0 0 1-.707.293H5v-1.293a1 1 0 0 1 .293-.707L15 4Z" /></svg>
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 text-lg px-2"
                    title="Projekt entfernen"
                    onClick={e => { e.preventDefault(); handleRemoveProject(entry.id); }}
                  >×</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-bold mb-3">Angefragte Projekte</h2>
        {requestedProjects.length === 0 ? (
          <div className="text-gray-500 text-sm">Keine Anfragen gestellt.</div>
        ) : (
          <ul className="space-y-2">
            {requestedProjects.map(entry => (
              <li key={entry.id} className="flex items-center justify-between gap-2">
                <a href={`/boerse/${entry.id}`} className="text-primary hover:underline font-medium">{entry.title}</a>
                <div className="flex items-center gap-1">
                  <button
                    className="text-gray-500 hover:text-blue-600 text-lg px-2"
                    title="Anfrage bearbeiten"
                    onClick={e => { e.preventDefault(); handleEditRequest(entry); }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M17.414 2.586a2 2 0 0 0-2.828 0l-9.5 9.5A2 2 0 0 0 4 13.5V16a1 1 0 0 0 1 1h2.5a2 2 0 0 0 1.414-.586l9.5-9.5a2 2 0 0 0 0-2.828l-2.5-2.5ZM15 4l2 2-9.5 9.5a1 1 0 0 1-.707.293H5v-1.293a1 1 0 0 1 .293-.707L15 4Z" /></svg>
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 text-lg px-2"
                    title="Anfrage entfernen"
                    onClick={e => { e.preventDefault(); handleRemoveRequest(entry.id); }}
                  >×</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {showEditModal && editProject && editProjectModal}
      {showEditRequestModal && editRequestEntry && (
        <EditRequestModal
          message={requestMessage}
          onClose={() => setShowEditRequestModal(false)}
          onSubmit={handleRequestSubmit}
          onDelete={handleDeleteRequest}
          loading={requestLoading}
          error={requestError}
          success={requestSuccess}
          isEdit={true}
        />
      )}
    </div>
  );
};

export default MarketplaceUserCard;
