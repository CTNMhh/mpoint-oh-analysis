"use client";

// Diese Datei rendert die statische Dummy-Börsenseite aus marktplatztailwind.tml
// und bindet sie als React-Komponente in Next.js ein.
// Tailwind wird über PostCSS eingebunden, nicht per CDN.

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

// --- Preis-Objekt zu String Funktion für Vorschau und Anzeige ---
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

// Kategorie-Farben Mapping (Tailwind-Klassen)
const categoryColorClasses: Record<string, string> = {
  "DIENSTLEISTUNG": "bg-blue-50 text-blue-700",
  "PRODUKT": "bg-violet-50 text-violet-700",
  "DIGITALISIERUNG": "bg-green-50 text-green-700",
  "NACHHALTIGKEIT": "bg-green-50 text-green-700",
  "MANAGEMENT": "bg-blue-50 text-blue-700",
};

// Typ-Farben Mapping für Anfrage/Angebot
const typeColors: Record<string, string> = {
  "Anfrage": "bg-yellow-50 text-yellow-700",
  "Angebot": "bg-blue-50 text-blue-700",
};


// Preis-Typ und Hilfsfunktion

function renderPrice(price: PriceType): string {
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

const maximumProSeite = 6;

// Hilfsfunktion: Timestamp zu relativer Zeit (Deutsch)
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

export default function MarketplaceDummy() {
  // State für Projekt-Bearbeiten-Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProject, setEditProject] = useState<any>(null);
  // --- Eigene Projekte und angefragte Projekte ---
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [requestedProjects, setRequestedProjects] = useState<any[]>([]);

  // Entfernen eines eigenen Projekts
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

  // Entfernen einer eigenen Anfrage
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
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);
  // Modal für Anfrage/Bearbeiten pro Eintrag
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [activeEntry, setActiveEntry] = useState<any>(null);
  const [userRequests, setUserRequests] = useState<Record<string, any>>({});
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Preis-Eingabe State für Modal ---
  const [priceInput, setPriceInput] = useState<PriceType>({});
  const [priceMode, setPriceMode] = useState<string>("fixed");

  // Filter-States
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Alle");
  const [typeFilter, setTypeFilter] = useState<string>("Beide"); // "Anfrage", "Angebot", "Beide"

  // Seite aus URL-Parametern lesen
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;


  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setMyProjects([]);
      setRequestedProjects([]);
      return;
    }
    // Eigene Projekte filtern
    setMyProjects(entries.filter(entry => entry.userId === session.user.id));
    // Angefragte Projekte filtern
    const requestedIds = Object.keys(userRequests);
    setRequestedProjects(entries.filter(entry => requestedIds.includes(entry.id)));
  }, [entries, userRequests, session]);

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
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, [session]);

  // Filterung
  let filteredEntries = entries.filter(entry => {
    // Kategorie-Filter
    const categoryMatch = categoryFilter === "Alle" || entry.category === categoryFilter.toUpperCase();
    // Typ-Filter
    const typeMatch = typeFilter === "Beide" || entry.type === typeFilter;
    // Such-Filter
    const searchMatch = searchValue.trim() === "" || (
      entry.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      entry.shortDescription.toLowerCase().includes(searchValue.toLowerCase()) ||
      entry.longDescription.toLowerCase().includes(searchValue.toLowerCase())
    );
    return categoryMatch && typeMatch && searchMatch;
  });

  // Pagination
  const totalEntries = filteredEntries.length;
  const totalPages = Math.ceil(totalEntries / maximumProSeite);
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * maximumProSeite, currentPage * maximumProSeite);

  // Handler für Seitenwechsel
  const handlePageChange = (pageNum: number) => {
    // Seite wechseln, Filter bleiben erhalten
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNum.toString());
  router.push(`/boerse?${params.toString()}`);
  };

  // Kategorie-Filter Handler
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  // Typ-Filter Handler
  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
  };

  // Suchfeld Handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Preis-Eingabe-Handler
  const handlePriceChange = (field: keyof PriceType, value: any) => {
    setPriceInput(prev => ({ ...prev, [field]: value }));
  }

  // Anfrage-Modal Handler
  const openRequestModal = (entry: any) => {
    setActiveEntry(entry);
    setRequestMessage(userRequests[entry.id]?.message || "");
    setRequestError(null);
    setRequestSuccess(null);
    setShowRequestModal(true);
  };

  async function handleRequestSubmit() {
    if (!activeEntry) return;
    setRequestLoading(true);
    setRequestError(null);
    setRequestSuccess(null);
    try {
      const method = userRequests[activeEntry.id] ? "PATCH" : "POST";
      const res = await fetch("/api/marketplace/request", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeEntry.id, message: requestMessage }),
      });
      if (res.ok) {
        setRequestSuccess(userRequests[activeEntry.id] ? "Anfrage erfolgreich bearbeitet!" : "Anfrage erfolgreich gesendet!");
        setShowRequestModal(false);
        setRequestMessage("");
        // Reload userRequest for this entry
        const reqRes = await fetch(`/api/marketplace/request?projectId=${activeEntry.id}`);
        const reqData = await reqRes.json();
        setUserRequests(prev => ({ ...prev, [activeEntry.id]: reqData.request }));
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
    if (!activeEntry) return;
    setDeleteLoading(true);
    setRequestError(null);
    try {
      const res = await fetch("/api/marketplace/request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeEntry.id }),
      });
      if (res.ok) {
        setShowRequestModal(false);
        setRequestMessage("");
        setUserRequests(prev => {
          const copy = { ...prev };
          delete copy[activeEntry.id];
          return copy;
        });
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
        setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen relative pt-24">
      {/* Ladeanzeige während die Einträge geladen werden */}
      {loading && (
        <div className="max-w-3xl mx-auto py-12 px-4 text-center text-gray-500 text-lg">
          Lädt Einträge...
        </div>
      )}
      {/* Modal (außerhalb des Seiten-Containers platzieren) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-11/12 max-w-2xl max-h-screen overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">Neues Projekt einstellen</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl p-1 hover:bg-gray-100 rounded"
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
                    Beschreibung (lang)
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
                      Deadline
                    </label>
                    <input
                      type="date"
                      id="projectDeadline"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                {/* Budget / Preis-Eingabe */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget / Preis</label>
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
                          />
                          <span className="text-gray-500">bis</span>
                          <input
                            type="number"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="Bis"
                            min="0"
                            step="0.01"
                            value={priceInput.to ?? ""}
                            onChange={e => handlePriceChange("to", e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </>
                      )}
                      <span className="text-gray-500">€</span>
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
                {/* Kontakt E-Mail */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="contactEmail">
                    Kontakt E-Mail <span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="ihre@email.de"
                    required
                  />
                </div>
                {/* Kontakt-Erlaubnis Checkbox */}
                <div className="mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" id="allowContact" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" required />
                    <span className="text-sm">Ich stimme zu, dass Interessenten mich kontaktieren dürfen <span className="text-primary">*</span></span>
                  </label>
                </div>
                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-5 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-6 py-3 border border-[#e31e24] bg-white text-[#e31e24] rounded-lg font-medium hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    Abbrechen
                  </button>
                  <button type="submit" className="px-6 py-3 bg-[#e31e24] text-white rounded-lg font-medium hover:bg-[#c01a1f] hover:shadow transition-colors">
                    Projekt veröffentlichen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {!loading && (
        <div className="max-w-7xl mx-auto p-5 relative z-0">
          {/* Meine Projekte & Angefragte Projekte Karte */}
          {session?.user?.id && (
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
                        <div className="flex items-center gap-1">
                          <button
                            className="text-gray-500 hover:text-blue-600 text-lg px-2"
                            title="Projekt bearbeiten"
                            onClick={() => { setEditProject(entry); setShowEditModal(true); }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M17.414 2.586a2 2 0 0 0-2.828 0l-9.5 9.5A2 2 0 0 0 4 13.5V16a1 1 0 0 0 1 1h2.5a2 2 0 0 0 1.414-.586l9.5-9.5a2 2 0 0 0 0-2.828l-2.5-2.5ZM15 4l2 2-9.5 9.5a1 1 0 0 1-.707.293H5v-1.293a1 1 0 0 1 .293-.707L15 4Z" /></svg>
                          </button>
      {/* Modal für Projekt bearbeiten */}
      {showEditModal && editProject && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-11/12 max-w-2xl max-h-screen overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">Projekt bearbeiten</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl p-1 hover:bg-gray-100 rounded"
                onClick={() => setShowEditModal(false)}
                aria-label="Schließen"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={async e => {
                e.preventDefault();
                if (!editProject) return;
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const entryType = (form.elements.namedItem("entryType") as HTMLInputElement)?.value || null;
                const title = (form.elements.namedItem("projectTitle") as HTMLInputElement)?.value.trim() || null;
                const category = (form.elements.namedItem("projectCategory") as HTMLSelectElement)?.value.toUpperCase() || null;
                const shortDescription = (form.elements.namedItem("projectShortDescription") as HTMLInputElement)?.value.trim() || null;
                let longDescription: string | null = (form.querySelector("#projectLongDescription") as HTMLDivElement)?.innerHTML?.trim() || null;
                if (longDescription === "" || longDescription === "<br>") longDescription = null;
                const location = (form.elements.namedItem("projectLocation") as HTMLInputElement)?.value.trim() || null;
                const deadlineRaw = (form.elements.namedItem("projectDeadline") as HTMLInputElement)?.value;
                const deadline = deadlineRaw ? new Date(deadlineRaw).toISOString() : null;
                const skills = (form.elements.namedItem("projectSkills") as HTMLInputElement)?.value.trim() || null;
                const email = (form.elements.namedItem("contactEmail") as HTMLInputElement)?.value.trim() || null;
                const publicEmail = (form.elements.namedItem("allowContact") as HTMLInputElement)?.checked || false;
                const price = Object.keys(editProject.price || {}).length > 0 ? editProject.price : null;
                const payload = {
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
                  const res = await fetch(`/api/marketplace/${editProject.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  if (res.ok) {
                    setShowEditModal(false);
                    // Aktualisiere die Einträge
                    const entriesRes = await fetch("/api/marketplace");
                    const data = await entriesRes.json();
                    const enrichedData = await Promise.all(data.map(async (entry: any) => {
                      const userName = await getUserNameById(entry.userId);
                      return { ...entry, userName };
                    }));
                    setEntries(enrichedData);
                  } else {
                    alert("Fehler beim Bearbeiten des Eintrags.");
                  }
                } catch (err) {
                  alert("Fehler beim Bearbeiten des Eintrags.");
                }
              }}>
                {/* Typ-Auswahl Angebot/Anfrage */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Typ <span className="text-primary">*</span></label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-700">
                      <input type="radio" name="entryType" value="Anfrage" defaultChecked={editProject.type === "Anfrage"} /> Anfrage
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
                      <input type="radio" name="entryType" value="Angebot" defaultChecked={editProject.type === "Angebot"} /> Angebot
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
                    defaultValue={editProject.title}
                    required
                  />
                </div>
                {/* Kategorie */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectCategory">
                    Kategorie <span className="text-primary">*</span>
                  </label>
                  <select id="projectCategory" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" defaultValue={editProject.category?.toLowerCase()} required>
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
                    defaultValue={editProject.shortDescription}
                    required
                  />
                </div>
                {/* Beschreibung (lang) WYSIWYG Editor */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectLongDescription">
                    Beschreibung (lang)
                  </label>
                  <div
                    id="projectLongDescription"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm min-h-24 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    contentEditable={true}
                    style={{ minHeight: "96px" }}
                    suppressContentEditableWarning={true}
                    dangerouslySetInnerHTML={{ __html: editProject.longDescription || "" }}
                  />
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
                      defaultValue={editProject.location}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectDeadline">
                      Deadline
                    </label>
                    <input
                      type="date"
                      id="projectDeadline"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      defaultValue={editProject.deadline ? editProject.deadline.slice(0, 10) : ""}
                    />
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
                    defaultValue={editProject.skills}
                  />
                </div>
                {/* Kontakt E-Mail */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="contactEmail">
                    Kontakt E-Mail <span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="ihre@email.de"
                    defaultValue={editProject.email}
                    required
                  />
                </div>
                {/* Kontakt-Erlaubnis Checkbox */}
                <div className="mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" id="allowContact" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" defaultChecked={!!editProject.publicEmail} />
                    <span className="text-sm">Ich stimme zu, dass Interessenten mich kontaktieren dürfen <span className="text-primary">*</span></span>
                  </label>
                </div>
                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-5 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-6 py-3 border border-blue-600 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-600 hover:text-white hover:shadow transition-colors"
                    onClick={() => setShowEditModal(false)}
                  >
                    Abbrechen
                  </button>
                  <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow transition-colors">
                    Bearbeiten
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
                          <button
                            className="text-red-500 hover:text-red-700 text-lg px-2"
                            title="Projekt entfernen"
                            onClick={() => handleRemoveProject(entry.id)}
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
                            onClick={() => openRequestModal(entry)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M17.414 2.586a2 2 0 0 0-2.828 0l-9.5 9.5A2 2 0 0 0 4 13.5V16a1 1 0 0 0 1 1h2.5a2 2 0 0 0 1.414-.586l9.5-9.5a2 2 0 0 0 0-2.828l-2.5-2.5ZM15 4l2 2-9.5 9.5a1 1 0 0 1-.707.293H5v-1.293a1 1 0 0 1 .293-.707L15 4Z" /></svg>
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700 text-lg px-2"
                            title="Anfrage entfernen"
                            onClick={() => handleRemoveRequest(entry.id)}
                          >×</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        {/* Header */}
        <div className="bg-white p-5 rounded-lg shadow-sm mb-8">
          <h1 className="text-primary text-2xl font-bold mb-4">Börse</h1>
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-5 items-center">
          <input
            type="text"
            className="flex-1 px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Projekte, Dienstleistungen oder Produkte suchen..."
            value={searchValue}
            onChange={handleSearchChange}
            id="searchInput"
          />
          <select
            className="px-3 py-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            value={categoryFilter}
            onChange={handleCategoryChange}
          >
            <option value="Alle">Alle Kategorien</option>
            <option value="DIENSTLEISTUNG">Dienstleistung</option>
            <option value="PRODUKT">Produkt</option>
            <option value="DIGITALISIERUNG">Digitalisierung</option>
            <option value="NACHHALTIGKEIT">Nachhaltigkeit</option>
            <option value="MANAGEMENT">Management</option>
          </select>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${typeFilter === "Beide" ? "bg-primary text-white border-primary" : "bg-white text-gray-700 border-gray-300 hover:border-primary"}`}
              onClick={() => handleTypeChange("Beide")}
            >
              Beide
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${typeFilter === "Anfrage" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-white text-gray-700 border-gray-300 hover:border-yellow-200"}`}
              onClick={() => handleTypeChange("Anfrage")}
            >
              Anfrage
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${typeFilter === "Angebot" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-700 border-gray-300 hover:border-blue-200"}`}
              onClick={() => handleTypeChange("Angebot")}
            >
              Angebot
            </button>
          </div>
        </div>
        </div>
        {/* Project Bar */}
        <div className="mb-5">
          <button
            className="bg-[#e31e24] text-white px-4 py-2 rounded-full font-medium hover:bg-[#c01a1f] transition-colors shadow"
            onClick={() => setShowModal(true)}
          >
            Eigenes Projekt einstellen
          </button>
        </div>
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div className="text-gray-600 text-sm" id="resultsCount">
            {totalEntries} Ergebnis{totalEntries === 1 ? '' : 'se'} gefunden
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm" id="sortDropdown">
            <option>Relevanz</option>
            <option>Neueste zuerst</option>
            <option>Preis aufsteigend</option>
            <option>Preis absteigend</option>
            <option>Bewertung</option>
          </select>
        </div>
        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10" id="resultsGrid">
          {paginatedEntries.map(entry => {
            const userRequest = userRequests[entry.id];
            const requestButton = userRequest ? (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 hover:shadow transition-colors"
                onClick={e => { e.stopPropagation(); openRequestModal(entry); }}
              >
                Bearbeiten
              </button>
            ) : (
              <button
                className="px-4 py-2 bg-[#e31e24] text-white rounded text-sm font-medium hover:bg-[#c01a1f] hover:shadow transition-colors"
                onClick={e => { e.stopPropagation(); openRequestModal(entry); }}
              >
                Anfragen
              </button>
            );
            return (
              <div
                key={entry.id}
                className="result-card bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
                onClick={e => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  router.push(`/boerse/${entry.id}`);
                }}
              >
                <div className="p-4 border-b border-gray-100 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`card-category px-3 py-1 rounded-full text-xs font-medium ${categoryColorClasses[entry.category] || "bg-gray-50 text-gray-700"}`}
                    >
                      {entry.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[entry.type] || "bg-gray-50 text-gray-700"}`}>
                      {entry.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base mb-2 text-gray-900">{entry.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">{entry.shortDescription}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-auto">
                    <div className="flex items-center gap-2">
                      <span>{entry.userName}</span>
                    </div>
                    <span>{timeAgo(new Date(entry.createdAt).getTime())}</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                  <div className="font-semibold text-primary text-base">{renderPrice(entry.price)}</div>
                  {requestButton}
                </div>
              </div>
            );
          })}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              className={`px-3 py-2 border border-[#e31e24] bg-white text-[#e31e24] rounded text-sm font-medium hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              ← Zurück
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                className={`px-3 py-2 border rounded text-sm font-medium hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors ${currentPage === idx + 1 ? "bg-[#e31e24] text-white border-[#e31e24]" : "bg-white text-[#e31e24] border-[#e31e24]"}`}
                onClick={() => handlePageChange(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
            <button
              className={`px-3 py-2 border border-[#e31e24] bg-white text-[#e31e24] rounded text-sm font-medium hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Weiter →
            </button>
          </div>
        )}
        </div>
      )}
      {/* Anfrage Modal für Listenansicht */}
      {showRequestModal && activeEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">{userRequests[activeEntry.id] ? "Anfrage bearbeiten" : "Projekt anfragen"}</h2>
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
              {userRequests[activeEntry.id] && (
                <button className="px-5 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={handleDeleteRequest} disabled={deleteLoading || requestLoading}>Löschen</button>
              )}
              <button className="px-5 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => setShowRequestModal(false)} disabled={requestLoading || deleteLoading}>Abbrechen</button>
              <button className={`px-5 py-2 rounded ${userRequests[activeEntry.id] ? "bg-blue-600 hover:bg-blue-700" : "bg-[#e31e24] hover:bg-[#c01a1f]"} text-white font-medium hover:shadow transition-colors`} onClick={handleRequestSubmit} disabled={requestLoading || deleteLoading || !requestMessage.trim()}>
                {userRequests[activeEntry.id] ? "Speichern" : "Anfrage senden"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
