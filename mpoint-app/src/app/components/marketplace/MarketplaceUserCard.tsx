import React, { useState, useEffect } from "react";

// window.showMessageModal als optionales Property deklarieren
declare global {
  interface Window {
    showMessageModal?: boolean;
  }
}
import EditRequestModal from "./EditRequestModal";
import MessageModal from "./MessageModal";

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
  // Anzahl PENDING-Anfragen pro Projekt (für Badge)
  const [projectRequestCounts, setProjectRequestCounts] = useState<Record<string, number>>({});
  // Gesamtanzahl Anfragen pro Projekt (für Icon-Farbe/Klickbarkeit)
  const [projectTotalRequestCounts, setProjectTotalRequestCounts] = useState<Record<string, number>>({});
  // State für Anfrage-Bearbeiten-Modal
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [editRequestEntry, setEditRequestEntry] = useState<any>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  // State für Nachrichten-Modal
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalEntry, setMessageModalEntry] = useState<any>(null);
  const [messageRequests, setMessageRequests] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

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
      await Promise.all(myProjects.map(async (entry) => {
        try {
          // PENDING Count für Badge
          const resPending = await fetch(`/api/marketplace/request?countRequestId=${entry.id}&status=PENDING`);
          const dataPending = await resPending.json();
          pendingCounts[entry.id] = dataPending.count ?? 0;
        } catch {
          pendingCounts[entry.id] = 0;
        }
        try {
          // Gesamtcount für Icon-Farbe/Klickbarkeit
          const resTotal = await fetch(`/api/marketplace/request?countRequestId=${entry.id}`);
          const dataTotal = await resTotal.json();
          totalCounts[entry.id] = dataTotal.count ?? 0;
        } catch {
          totalCounts[entry.id] = 0;
        }
      }));
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
        const enrichedData = await Promise.all(data.map(async (entry) => {
          const userName = await getUserNameById(entry.userId);
          return { ...entry, userName };
        }));
        setEntries(enrichedData);
        // Hole alle User-Requests für die Einträge
        if (session?.user?.id) {
          const requests: Record<string, any> = {};
          await Promise.all(enrichedData.map(async (entry: any) => {
            try {
              const resReq = await fetch(`/api/marketplace/request?projectId=${entry.id}`);
              const dataReq = await resReq.json();
              if (dataReq.request) requests[entry.id] = dataReq.request;
            } catch {}
          }));
          setUserRequests(requests);
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

  // Nachrichten-Modal öffnen und Anfragen laden
  async function handleOpenMessages(entry: any) {
    setMessageModalEntry(entry);
    setShowMessageModal(true);
    if (typeof window !== "undefined") {
      window.showMessageModal = true;
    }
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
        // Nutzername anreichern
        const enriched = await Promise.all(reqs.map(async (r: any) => {
          if (!r.userName && r.userId) {
            const name = await getUserNameById(r.userId);
            return { ...r, userName: name };
          }
          return r;
        }));
        setMessageRequests(enriched);
      } else {
        setMessageRequests([]);
      }
    } catch {
      setMessageRequests([]);
    }
  }

  function handleCloseMessages() {
    setShowMessageModal(false);
    setMessageModalEntry(null);
    setMessageRequests([]);
    if (typeof window !== "undefined") {
      window.showMessageModal = false;
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
  async function handleRejectRequest(requestId: string) {
    try {
      const res = await fetch("/api/marketplace/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ requestId, status: "DECLINED" }),
      });
      if (res.ok) {
  setMessageRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "DECLINED" } : r));
        if (messageModalEntry?.id) {
          refreshCountsForProject(messageModalEntry.id);
        }
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

  // --- NEU: Submit-Handler für das Modal-Formular ---
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    // Alle Felder aus dem Formular korrekt auslesen
    const entryType = (form.elements.namedItem("entryType") as HTMLInputElement)?.value || null;
    const title = (form.elements.namedItem("projectTitle") as HTMLInputElement)?.value.trim() || null;
    const category = (form.elements.namedItem("projectCategory") as HTMLSelectElement)?.value.toUpperCase() || null;
    const shortDescription = (form.elements.namedItem("projectShortDescription") as HTMLInputElement)?.value.trim() || null;
    // longDescription aus contenteditable div
    let longDescription: string | null = (form.querySelector("#projectLongDescription") as HTMLDivElement)?.innerHTML?.trim() || null;
    if (longDescription === "" || longDescription === "<br>") longDescription = null;
    const location = (form.elements.namedItem("projectLocation") as HTMLInputElement)?.value.trim() || null;
    const deadlineRaw = (form.elements.namedItem("projectDeadline") as HTMLInputElement)?.value;
    const deadline = deadlineRaw ? new Date(deadlineRaw).toISOString() : null;
    const skills = (form.elements.namedItem("projectSkills") as HTMLInputElement)?.value.trim() || null;
    const email = (form.elements.namedItem("contactEmail") as HTMLInputElement)?.value.trim() || null;
    const publicEmail = (form.elements.namedItem("allowContact") as HTMLInputElement)?.checked || false;
    // Preis aus State
    const price = Object.keys(priceInput).length > 0 ? priceInput : null;

    // Userdaten aus Session
    const user = session?.user;
    if (!user?.id) {
      alert("Nicht eingeloggt. Bitte zuerst anmelden.");
      return;
    }

    // Payload für MarketplaceEntry
    const payload = {
      userId: user.id,
      category,
      title,
      shortDescription,
      longDescription,
      price,
      type: entryType,
      email,
      publicEmail,
      location,
      deadline,
      skills,
    };
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowModal(false);
        // Nach dem Anlegen neu laden
        const entriesRes = await fetch("/api/marketplace");
        const data = await entriesRes.json();
        const enrichedData = await Promise.all(data.map(async (entry: any) => {
          const userName = await getUserNameById(entry.userId);
          return { ...entry, userName };
        }));
        setEntries(enrichedData);
      } else {
        alert("Fehler beim Anlegen des Eintrags.");
      }
    } catch (err) {
      alert("Fehler beim Anlegen des Eintrags.");
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm mb-8 p-6 flex flex-col md:flex-row gap-8">
      {/* Modal (außerhalb des Seiten-Containers platzieren) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-11/12 max-w-2xl max-h-screen overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">Neues Projekt einstellen</h2>
              <button
                className="text-gray-600 hover:text-gray-700 text-2xl p-1 hover:bg-gray-100 rounded-xl  cursor-pointer"
                onClick={() => setShowModal(false)}
                aria-label="Schließen"
              >
                ×
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                {/* Typ-Auswahl Angebot/Anfrage */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Typ <span className="text-primary">*</span></label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-700">
                      <input type="radio" name="entryType" value="Anfrage" defaultChecked /> Anfrage
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
                      <input type="radio" name="entryType" value="Angebot" /> Angebot
                    </label>
                  </div>
                </div>
                {/* Projekttitel */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectTitle">
                    Projekttitel <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    id="projectTitle"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="z.B. Website-Relaunch für Startup"
                    required
                  />
                </div>
                {/* Kategorie */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectCategory">
                    Kategorie <span className="text-primary">*</span>
                  </label>
                  <select id="projectCategory" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" required>
                    <option value="">Kategorie auswählen</option>
                    <option value="dienstleistung">Dienstleistung</option>
                    <option value="produkt">Produkt</option>
                    <option value="digitalisierung">Digitalisierung</option>
                    <option value="nachhaltigkeit">Nachhaltigkeit</option>
                    <option value="management">Management</option>
                    <option value="marketing">Marketing</option>
                    <option value="consulting">Consulting</option>
                  </select>
                </div>
                {/* Beschreibung (kurz) */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectShortDescription">
                    Beschreibung (kurz) <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    id="projectShortDescription"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Kurze Projektbeschreibung..."
                    required
                  />
                </div>

                {/* Beschreibung (lang) WYSIWYG Editor */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectLongDescription">
                    Beschreibung (lang) <span className="text-primary">*</span>
                  </label>
                  {/* Simple WYSIWYG Editor: contenteditable div, kann später durch ein echtes Editor-Component ersetzt werden */}
                  <div
                    id="projectLongDescription"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm min-h-24 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    contentEditable={true}
                    style={{ minHeight: "96px" }}
                    suppressContentEditableWarning={true}
                  >
                  </div>
                </div>
                {/* Standort und Deadline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectLocation">
                      Standort
                    </label>
                    <input
                      type="text"
                      id="projectLocation"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="z.B. München, Remote"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectDeadline">
                      Deadline <span className="text-primary">*</span>
                    </label>
                    <input
                      type="date"
                      id="projectDeadline"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
                {/* Budget / Preis-Eingabe */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget / Preis <span className="text-primary">*</span></label>
                  <div className="flex gap-4 mb-3 flex-wrap">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="priceMode" value="fixed" checked={priceMode === "fixed"} onChange={() => handlePriceModeChange("fixed")} />
                      Festpreis
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="priceMode" value="ab" checked={priceMode === "ab"} onChange={() => handlePriceModeChange("ab")} />
                      ab Preis
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="priceMode" value="range" checked={priceMode === "range"} onChange={() => handlePriceModeChange("range")} />
                      von ... bis ...
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="priceMode" value="perHour" checked={priceMode === "perHour"} onChange={() => handlePriceModeChange("perHour")} />
                      pro Stunde
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="priceMode" value="perWeek" checked={priceMode === "perWeek"} onChange={() => handlePriceModeChange("perWeek")} />
                      pro Woche
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="priceMode" value="perMonth" checked={priceMode === "perMonth"} onChange={() => handlePriceModeChange("perMonth")} />
                      pro Monat
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="priceMode" value="onRequest" checked={priceMode === "onRequest"} onChange={() => handlePriceModeChange("onRequest")} />
                      Auf Anfrage
                    </label>
                  </div>
                  {/* Preisfelder je nach Modus */}
                  {priceMode !== "onRequest" && (
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      {(priceMode === "fixed" || priceMode === "ab" || priceMode === "perHour" || priceMode === "perWeek" || priceMode === "perMonth") && (
                        <input
                          type="number"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          placeholder={priceMode === "ab" ? "ab Preis" : "Preis"}
                          min="0"
                          step="0.01"
                          value={priceInput.from ?? ""}
                          onChange={e => handlePriceChange("from", e.target.value ? Number(e.target.value) : undefined)}
                          required
                        />
                      )}
                      {priceMode === "range" && (
                        <>
                          <input
                            type="number"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="Von"
                            min="0"
                            step="0.01"
                            value={priceInput.from ?? ""}
                            onChange={e => handlePriceChange("from", e.target.value ? Number(e.target.value) : undefined)}
                            required
                          />
                          <span className="text-gray-600">bis</span>
                          <input
                            type="number"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="Bis"
                            min="0"
                            step="0.01"
                            value={priceInput.to ?? ""}
                            onChange={e => handlePriceChange("to", e.target.value ? Number(e.target.value) : undefined)}
                            required
                          />
                        </>
                      )}
                      <span className="text-gray-600">€</span>
                    </div>
                  )}
                  {/* Zusatzoptionen entfernt, Flags werden automatisch gesetzt */}
                  {/* Preisvorschau */}
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="font-semibold">Preisvorschau:</span> {priceDataToString(priceInput)}
                  </div>
                </div>
                {/* Benötigte Fähigkeiten */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectSkills">
                    Benötigte Fähigkeiten
                  </label>
                  <input
                    type="text"
                    id="projectSkills"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="z.B. JavaScript, React, Design, SEO (mit Komma trennen)"
                  />
                </div>
                {/* Form Actions */}
                {/* Dummy Checkbox: Anonym einstellen */}
                {/*
                <div className="mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" id="anonymous" name="anonymous" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                    <span className="text-sm">Anonym einstellen (Unternehmensname wird nicht angezeigt)</span>
                  </label>
                </div>
                */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-5 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-6 py-3 border border-[#e31e24] bg-white text-[#e31e24] rounded-lg font-medium hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    Abbrechen
                  </button>
                  <button type="submit" className="px-6 py-3 bg-[#e60000] text-white rounded-lg font-medium hover:bg-[#c01a1f] hover:shadow transition-colors cursor-pointer">
                    Projekt veröffentlichen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Meine Projekte</h2>
        <div className="mb-5">
          <button
            className="bg-[#e60000] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#c01a1f] transition-colors shadow  cursor-pointer"
            onClick={() => setShowModal(true)}
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
              <li key={entry.id} className="flex items-center justify-between gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all">
                <a href={`/boerse/${entry.id}`} className="text-primary hover:underline font-medium">{entry.title}</a>
                <div className="flex items-center gap-1 relative">
                  <button
                    className={`relative text-lg px-2 cursor-pointer ${((projectTotalRequestCounts[entry.id] ?? 0) > 0) ? 'text-blue-600 hover:text-blue-700' : 'text-gray-300 cursor-not-allowed'}`}
                    title="Mitteilungen"
                    onClick={e => {
                      e.preventDefault();
                      const total = projectTotalRequestCounts[entry.id] ?? 0;
                      if (total > 0) {
                        handleOpenMessages(entry);
                      }
                    }}
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
                    className="text-gray-600 hover:text-blue-600 text-lg px-2 cursor-pointer"
                    title="Projekt bearbeiten"
                    onClick={e => { e.preventDefault(); onEditProject ? onEditProject(entry) : (setEditProject(entry), setShowEditModal(true)); }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M17.414 2.586a2 2 0 0 0-2.828 0l-9.5 9.5A2 2 0 0 0 4 13.5V16a1 1 0 0 0 1 1h2.5a2 2 0 0 0 1.414-.586l9.5-9.5a2 2 0 0 0 0-2.828l-2.5-2.5ZM15 4l2 2-9.5 9.5a1 1 0 0 1-.707.293H5v-1.293a1 1 0 0 1 .293-.707L15 4Z" /></svg>
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 text-lg px-2 cursor-pointer"
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Angefragte Projekte</h2>
        {requestedProjects.length === 0 ? (
          <div className="text-gray-600">Keine Anfragen gestellt.</div>
        ) : (
          <ul className="space-y-2">
            {requestedProjects.map(entry => (
              <li key={entry.id} className="flex items-center justify-between gap-2">
                <a href={`/boerse/${entry.id}`} className="text-primary hover:underline font-medium">{entry.title}</a>
                <div className="flex items-center gap-1">
                  <button
                    className="text-gray-600 hover:text-blue-600 text-lg px-2"
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
        {/* Nachrichten-Modal anzeigen */}
        {showMessageModal && messageModalEntry && (
          <MessageModal
            project={messageModalEntry}
            requests={messageRequests}
            onClose={handleCloseMessages}
            onReject={handleRejectRequest}
          />
        )}
    </div>
  );
};

export default MarketplaceUserCard;
