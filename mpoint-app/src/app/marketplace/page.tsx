"use client";

// Diese Datei rendert die statische Dummy-Börsenseite aus marktplatztailwind.tml
// und bindet sie als React-Komponente in Next.js ein.
// Tailwind wird über PostCSS eingebunden, nicht per CDN.

import { useEffect, useState, Suspense } from "react";
import {
  Briefcase,
  Search,
  Funnel,
  Grid3X3,
  Calendar,
  List,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import MarketplaceUserCard from "../components/marketplace/MarketplaceUserCard";
import EditProjectModal from "../components/marketplace/EditProjectModal";
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
  DIENSTLEISTUNG: "bg-blue-50 text-blue-700",
  PRODUKT: "bg-violet-50 text-violet-700",
  DIGITALISIERUNG: "bg-green-50 text-green-700",
  NACHHALTIGKEIT: "bg-green-50 text-green-700",
  MANAGEMENT: "bg-blue-50 text-blue-700",
};

// Typ-Farben Mapping für Anfrage/Angebot
const typeColors: Record<string, string> = {
  Anfrage: "bg-yellow-50 text-yellow-700",
  Angebot: "bg-blue-50 text-blue-700",
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
    return `vor ${mins} Minute${mins === 1 ? "" : "n"}`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `vor ${hours} Stunde${hours === 1 ? "" : "n"}`;
  } else if (diff < week) {
    const days = Math.floor(diff / day);
    return `vor ${days} Tag${days === 1 ? "" : "en"}`;
  } else if (diff < month) {
    const weeks = Math.floor(diff / week);
    return `vor ${weeks} Woche${weeks === 1 ? "" : "n"}`;
  } else if (diff < year) {
    const months = Math.floor(diff / month);
    return `vor ${months} Monat${months === 1 ? "" : "en"}`;
  } else {
    const years = Math.floor(diff / year);
    return `vor ${years} Jahr${years === 1 ? "" : "en"}`;
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

function MarketplaceContent() {
  // State für Projekt-Bearbeiten-Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProject, setEditProject] = useState<any>(null);
  // --- Eigene Projekte und angefragte Projekte ---
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [requestedProjects, setRequestedProjects] = useState<any[]>([]);
  // Anfrage-Zähler für eigene Projekte
  const [projectRequestCounts, setProjectRequestCounts] = useState<
    Record<string, number>
  >({});
  // Hole die Anzahl der Anfragen für eigene Projekte
  useEffect(() => {
    async function fetchRequestCounts() {
      if (!myProjects.length) return;
      const counts: Record<string, number> = {};
      await Promise.all(
        myProjects.map(async (entry) => {
          try {
            const res = await fetch(
              `/api/marketplace/request?countRequestId=${entry.id}`
            );
            const data = await res.json();
            counts[entry.id] = data.count ?? 0;
          } catch {
            counts[entry.id] = 0;
          }
        })
      );
      setProjectRequestCounts(counts);
    }
    fetchRequestCounts();
  }, [myProjects]);

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
    setMyProjects(entries.filter((entry) => entry.userId === session.user.id));
    // Angefragte Projekte filtern
    const requestedIds = Object.keys(userRequests);
    setRequestedProjects(
      entries.filter((entry) => requestedIds.includes(entry.id))
    );
  }, [entries, userRequests, session]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch("/api/marketplace");
        const data = await res.json();
        // Email entfernen, falls vorhanden
        const cleaned = data.map((entry: any) => {
          const { email, ...rest } = entry;
          return rest;
        });
        const enrichedData = await Promise.all(
          cleaned.map(async (entry) => {
            const userName = await getUserNameById(entry.userId);
            return { ...entry, userName };
          })
        );
        setEntries(enrichedData);
        // Hole alle User-Requests für die Einträge
        if (session?.user?.id) {
          const requests: Record<string, any> = {};
          await Promise.all(
            enrichedData.map(async (entry: any) => {
              try {
                const resReq = await fetch(
                  `/api/marketplace/request?projectId=${entry.id}`
                );
                const dataReq = await resReq.json();
                if (dataReq.request) requests[entry.id] = dataReq.request;
              } catch {}
            })
          );
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
  let filteredEntries = entries.filter((entry) => {
    // Kategorie-Filter
    const categoryMatch =
      categoryFilter === "Alle" ||
      entry.category === categoryFilter.toUpperCase();
    // Typ-Filter
    const typeMatch = typeFilter === "Beide" || entry.type === typeFilter;
    // Such-Filter
    const searchMatch =
      searchValue.trim() === "" ||
      entry.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      entry.shortDescription
        .toLowerCase()
        .includes(searchValue.toLowerCase()) ||
      entry.longDescription.toLowerCase().includes(searchValue.toLowerCase());
    return categoryMatch && typeMatch && searchMatch;
  });

  // Pagination
  const totalEntries = filteredEntries.length;
  const totalPages = Math.ceil(totalEntries / maximumProSeite);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * maximumProSeite,
    currentPage * maximumProSeite
  );

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
        body: JSON.stringify({
          projectId: activeEntry.id,
          message: requestMessage,
        }),
      });
      if (res.ok) {
        setRequestSuccess(
          userRequests[activeEntry.id]
            ? "Anfrage erfolgreich bearbeitet!"
            : "Anfrage erfolgreich gesendet!"
        );
        setShowRequestModal(false);
        setRequestMessage("");
        // Reload userRequest for this entry
        const reqRes = await fetch(
          `/api/marketplace/request?projectId=${activeEntry.id}`
        );
        const reqData = await reqRes.json();
        setUserRequests((prev) => ({
          ...prev,
          [activeEntry.id]: reqData.request,
        }));
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
        setUserRequests((prev) => {
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

  return (
    <>
      {/* Ladeanzeige während die Einträge geladen werden */}
      {loading && (
        <div className="relative min-h-screen bg-gray-50 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)] mx-auto mb-4"></div>
            <p className="text-gray-600">Lädt Börse...</p>
          </div>
        </div>
      )}
      {!loading && (
        <div className="relative min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-4">
                <Briefcase
                  className="w-8 h-8 text-[#e60000]"
                  aria-hidden="true"
                />
                Börse
              </h1>
              <p className="text-gray-600">
                Hier finden Sie alle Informationen zu Projekten,
                Dienstleistungen und Produkten.
              </p>
            </div>
            {/* Project Bar */}

            {/* Meine Projekte & Angefragte Projekte als Komponente */}
            {session?.user?.id && (
              <>
                <MarketplaceUserCard
                  session={session}
                  entries={entries}
                  userRequests={userRequests}
                  setEntries={setEntries}
                  setUserRequests={setUserRequests}
                  onEditProject={(entry) => {
                    setEditProject(entry);
                    setShowEditModal(true);
                  }}
                />
                {showEditModal && editProject && (
                  <EditProjectModal
                    project={editProject}
                    onClose={() => setShowEditModal(false)}
                    onSubmit={async (formData) => {
                      // Patch-Request analog zum bisherigen Modal
                      try {
                        const res = await fetch(
                          `/api/marketplace/${editProject.id}`,
                          {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(formData),
                          }
                        );
                        if (res.ok) {
                          setShowEditModal(false);
                          // Aktualisiere die Einträge
                          const entriesRes = await fetch("/api/marketplace");
                          const data = await entriesRes.json();
                          const enrichedData = await Promise.all(
                            data.map(async (entry: any) => {
                              const userName = await getUserNameById(
                                entry.userId
                              );
                              return { ...entry, userName };
                            })
                          );
                          setEntries(enrichedData);
                        } else {
                          alert("Fehler beim Bearbeiten des Eintrags.");
                        }
                      } catch (err) {
                        alert("Fehler beim Bearbeiten des Eintrags.");
                      }
                    }}
                  />
                )}
              </>
            )}
            <div className="bg-white p-5 rounded-lg shadow-sm mb-8">
              {/* Header */}
              <h2 className="text-primary text-xl font-bold mb-4">Filter</h2>
              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-5 items-center">
                <div className="flex-1 flex items-center bg-white rounded-lg shadow-sm px-4 py-2">
                  <Search className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    className="flex-1 outline-none bg-transparent text-gray-900"
                    placeholder="Projekte, Dienstleistungen oder Produkte suchen..."
                    value={searchValue}
                    onChange={handleSearchChange}
                    id="searchInput"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-3">
                  <Funnel className="w-5 h-5 text-gray-400 mr-2" />
                  <select
                    className="pe-3 py-2 text-gray-900"
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
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-xl font-medium border transition-colors cursor-pointer ${
                      typeFilter === "Beide"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                    }`}
                    onClick={() => handleTypeChange("Beide")}
                  >
                    Beide
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-xl font-medium border transition-colors cursor-pointer ${
                      typeFilter === "Anfrage"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-white text-gray-700 border-gray-300 hover:border-yellow-200"
                    }`}
                    onClick={() => handleTypeChange("Anfrage")}
                  >
                    Anfrage
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-xl font-medium border transition-colors cursor-pointer ${
                      typeFilter === "Angebot"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-200"
                    }`}
                    onClick={() => handleTypeChange("Angebot")}
                  >
                    Angebot
                  </button>
                </div>
              </div>

              {/* Results Header */}
              <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 mb-5">
                <div className="text-gray-600" id="resultsCount">
                  {totalEntries} Ergebnis{totalEntries === 1 ? "" : "se"}{" "}
                  gefunden
                </div>
              </div>

              {/* Results Grid */}
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
                id="resultsGrid"
              >
                {paginatedEntries.map((entry) => {
                  const userRequest = userRequests[entry.id];
                  const requestButton = userRequest ? (
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 hover:shadow transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        openRequestModal(entry);
                      }}
                    >
                      Bearbeiten
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 bg-[#e60000] text-white rounded-xl font-medium hover:bg-[#c01a1f] hover:shadow transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        openRequestModal(entry);
                      }}
                    >
                      Anfragen
                    </button>
                  );
                  return (
                    <div
                      key={entry.id}
                      className="result-card bg-white rounded-lg cursor-pointer overflow-hidden flex flex-col h-full border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("button")) return;
                        router.push(`/boerse/${entry.id}`);
                      }}
                    >
                      <div className="p-4 border-b border-gray-100 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`card-category px-3 py-1 rounded-xl text-xs font-medium ${
                              categoryColorClasses[entry.category] ||
                              "bg-gray-50 text-gray-700"
                            }`}
                          >
                            {entry.category}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-xl text-xs font-medium ${
                              typeColors[entry.type] ||
                              "bg-gray-50 text-gray-700"
                            }`}
                          >
                            {entry.type}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base mb-2 text-gray-900">
                          {entry.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                          {entry.shortDescription}
                        </p>
                        <div className="flex justify-between items-center text-xs text-gray-600 mt-auto">
                          <div className="flex items-center gap-2">
                            <span>{entry.userName}</span>
                          </div>
                          <span>
                            {timeAgo(new Date(entry.createdAt).getTime())}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 flex justify-between items-center">
                        <div className="font-semibold text-primary text-base">
                          {renderPrice(entry.price)}
                        </div>
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
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-xl font-medium hover:text-gray-900 transition-all cursor-pointer ${
                      currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-600 hover:text-gray-900" />
                    Zurück
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      className={`px-4 py-2 border rounded-xl font-medium hover:bg-[#e60000] transition-all cursor-pointer ${
                        currentPage === idx + 1
                          ? "bg-[#e60000] text-white border-[#e60000]"
                          : "bg-white text-gray-600 border-gray-600"
                      }`}
                      onClick={() => handlePageChange(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-600 font-medium hover:text-gray-900 transition-all cursor-pointer ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Weiter
                    <ArrowRight className="w-4 h-4 text-gray-600 hover:text-gray-900" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Anfrage Modal für Listenansicht */}
      {showRequestModal && activeEntry && (
        <div className="relative min-h-screen bg-gray-50 pt-20">
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full">
              <h2 className="text-lg font-bold mb-4">
                {userRequests[activeEntry.id]
                  ? "Anfrage bearbeiten"
                  : "Projekt anfragen"}
              </h2>
              <textarea
                className="w-full border rounded p-2 mb-4"
                rows={4}
                placeholder="Ihre Nachricht an den Anbieter..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                disabled={requestLoading || deleteLoading}
              />
              {requestError && (
                <div className="text-red-600 mb-2">{requestError}</div>
              )}
              {requestSuccess && (
                <div className="text-green-600 mb-2">{requestSuccess}</div>
              )}
              <div className="flex gap-3 justify-end">
                {userRequests[activeEntry.id] && (
                  <button
                    className="px-5 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                    onClick={handleDeleteRequest}
                    disabled={deleteLoading || requestLoading}
                  >
                    Löschen
                  </button>
                )}
                <button
                  className="px-5 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                  onClick={() => setShowRequestModal(false)}
                  disabled={requestLoading || deleteLoading}
                >
                  Abbrechen
                </button>
                <button
                  className={`px-5 py-2 rounded cursor-pointer ${
                    userRequests[activeEntry.id]
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-[#e60000] hover:bg-[#c01a1f]"
                  } text-white font-medium hover:shadow transition-colors`}
                  onClick={handleRequestSubmit}
                  disabled={
                    requestLoading || deleteLoading || !requestMessage.trim()
                  }
                >
                  {userRequests[activeEntry.id]
                    ? "Speichern"
                    : "Anfrage senden"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={<div className="py-12 text-center text-gray-600">Lädt...</div>}
    >
      <MarketplaceContent />
    </Suspense>
  );
}
