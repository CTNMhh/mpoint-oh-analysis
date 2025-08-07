"use client";
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

// Diese Datei rendert die statische Dummy-Marktplatzseite aus marktplatztailwind.tml
// und bindet sie als React-Komponente in Next.js ein.
// Tailwind wird über PostCSS eingebunden, nicht per CDN.

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

// Dummy-Daten mit timestamp statt time-String
const now = Date.now();

const dummyEntries = [
  {
    id: 1,
    category: "DIENSTLEISTUNG",
    title: "Website-Relaunch gesucht",
    short_description: "Wir suchen ein Team für Webentwicklung & Design. Moderne, responsive Website mit CMS-Integration gewünscht.",
    long_description: `<p>Wir suchen ein <strong>Team für Webentwicklung & Design</strong>. Unsere Anforderungen:</p>
      <ul>
        <li>Moderne, responsive Website</li>
        <li>CMS-Integration (z.B. WordPress, Strapi)</li>
        <li>SEO & Performance-Optimierung</li>
        <li>Design nach Corporate Identity</li>
      </ul>
      <p>Bitte Referenzen und grobe Preisvorstellung angeben.</p>`,
    price: { from: 10000, to: 15000 },
    type: "Anfrage",
    userName: "Thomas Müller",
    email: "thomas.mueller@example.com",
    publicEmail: false,
    timestamp: 1754568000000,
    actions: ["Details", "Anbieten"],
  },
  {
    id: 2,
    category: "PRODUKT",
    title: "Büromöbel – Großabnahme",
    short_description: "Preiswerte Büromöbel für Startups - jetzt anbieten. Hochwertige Schreibtische, Stühle und Schränke.",
    long_description: `<p>Großabnahme von <strong>Büromöbeln</strong> für Startups:</p>
      <ul>
        <li>Schreibtische, Stühle, Schränke</li>
        <li>Lieferung deutschlandweit</li>
        <li>Rabatte ab 10 Stück</li>
      </ul>
      <p>Jetzt Angebot einholen!</p>`,
    price: { from: 299, ab: true },
    type: "Angebot",
    userName: "Julia Schmidt",
    email: "julia.schmidt@firma.com",
    publicEmail: true,
    timestamp: 1754488800000,
    actions: ["Katalog", "Anfragen"],
  },
  {
    id: 3,
    category: "DIGITALISIERUNG",
    title: "KI-Einsatz im deutschen Mittelstand: Chancen und Herausforderungen",
    short_description: "Beratung zur Implementierung von KI-Lösungen und Automatisierungsprozesse für mittelständische Unternehmen.",
    long_description: `<p>Wir bieten <strong>Beratung zur Implementierung von KI-Lösungen</strong> und Automatisierungsprozessen für mittelständische Unternehmen.</p>
      <ul>
        <li>Analyse der Potenziale</li>
        <li>Workshops & Schulungen</li>
        <li>Begleitung bei der Umsetzung</li>
      </ul>
      <p>Kontaktieren Sie uns für ein individuelles Angebot.</p>`,
    price: { from: 150, perHour: true },
    type: "Angebot",
    userName: "Dr. Thomas Schmidt",
    email: "kontakt@ki-mittelstand.de",
    publicEmail: true,
    timestamp: 1754316000000,
    actions: ["Profil", "Kontakt"],
  },
  {
    id: 4,
    category: "NACHHALTIGKEIT",
    title: "Nachhaltige Lieferketten aufbauen: Ein Leitfaden",
    short_description: "Strategieberatung für umweltfreundliche und sozial verantwortliche Beschaffungsprozesse in Ihrem Unternehmen.",
    long_description: `<p><strong>Strategieberatung</strong> für umweltfreundliche und sozial verantwortliche Beschaffungsprozesse:</p>
      <ul>
        <li>Analyse bestehender Lieferketten</li>
        <li>Entwicklung nachhaltiger Strategien</li>
        <li>Workshops für Ihr Team</li>
      </ul>
      <p>Wir helfen Ihnen, Ihre Lieferkette zukunftsfähig zu machen.</p>`,
    price: { onRequest: true },
    type: "Angebot",
    userName: "Prof. Julia Müller",
    email: "jm@nachhaltigberatung.de",
    publicEmail: false,
    timestamp: 1754143200000,
    actions: ["Mehr Info", "Anfragen"],
  },
  {
    id: 5,
    category: "MANAGEMENT",
    title: "Remote Leadership: Best Practices für hybride Teams",
    short_description: "Schulungen und Workshops für Führungskräfte zur effektiven Leitung verteilter Teams in der neuen Arbeitswelt.",
    long_description: `<p><strong>Remote Leadership</strong>: Best Practices für hybride Teams.</p>
      <ul>
        <li>Schulungen für Führungskräfte</li>
        <li>Workshops zur Team-Kommunikation</li>
        <li>Tools & Methoden für hybrides Arbeiten</li>
      </ul>
      <p>Jetzt Workshop buchen!</p>`,
    price: { from: 1200, perDay: true },
    type: "Angebot",
    userName: "Lisa Weber",
    email: "lisa@leadership-tools.de",
    publicEmail: false,
    timestamp: 1753970400000,
    actions: ["Workshop", "Buchen"],
  },
  {
    id: 6,
    category: "PRODUKT",
    title: "ERP-Software für KMU",
    short_description: "Maßgeschneiderte Enterprise Resource Planning Lösung für kleine und mittlere Unternehmen. Cloud-basiert und skalierbar.",
    long_description: `<p><strong>ERP-Software</strong> für KMU:</p>
      <ul>
        <li>Cloud-basiert & skalierbar</li>
        <li>Individuelle Anpassung</li>
        <li>Support & Schulung</li>
      </ul>
      <p>Demo & Testzugang verfügbar.</p>`,
    price: { from: 99, ab: true, perMonth: true },
    type: "Angebot",
    userName: "Michael Klein",
    email: "info@kleinerp.de",
    publicEmail: false,
    timestamp: 1753365600000,
    actions: ["Demo", "Testen"],
  },
  {
    id: 7,
    category: "PRODUKT",
    title: "ERP-Software für KMU",
    short_description: "Maßgeschneiderte Enterprise Resource Planning Lösung für kleine und mittlere Unternehmen. Cloud-basiert und skalierbar.",
    long_description: `<p><strong>ERP-Software</strong> für KMU:</p>
      <ul>
        <li>Cloud-basiert & skalierbar</li>
        <li>Individuelle Anpassung</li>
        <li>Support & Schulung</li>
      </ul>
      <p>Demo & Testzugang verfügbar. Premium-Features ab € 199/Monat.</p>`,
    price: { from: 199, ab: true, perMonth: true },
    type: "Angebot",
    userName: "Michael Klein",
    email: "info@kleinerp.de",
    publicEmail: false,
    timestamp: 1753279200000,
    actions: ["Demo", "Testen"],
  },
];


export default function MarketplaceDummy() {
  const [showModal, setShowModal] = useState(false);
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

  // Filterung
  let filteredEntries = dummyEntries.filter(entry => {
    // Kategorie-Filter
    const categoryMatch = categoryFilter === "Alle" || entry.category === categoryFilter.toUpperCase();
    // Typ-Filter
    const typeMatch = typeFilter === "Beide" || entry.type === typeFilter;
    // Such-Filter
    const searchMatch = searchValue.trim() === "" || (
      entry.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      entry.short_description.toLowerCase().includes(searchValue.toLowerCase()) ||
      entry.long_description.toLowerCase().includes(searchValue.toLowerCase())
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
    router.push(`/marketplace?${params.toString()}`);
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
  };

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

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen relative">
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
              <form /* id="projectForm" */>
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
      <div className="max-w-7xl mx-auto p-5 relative z-0">
        {/* Header */}
        <div className="bg-white p-5 rounded-lg shadow-sm mb-8">
          <h1 className="text-primary text-2xl font-bold mb-4">🅼 Marktplatz</h1>
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
          {paginatedEntries.map(entry => (
            <div key={entry.id} className="result-card bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col h-full">
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
                <p className="text-gray-600 text-sm mb-3 leading-relaxed">{entry.short_description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-auto">
                  <div className="flex items-center gap-2">
                    <span>{entry.userName}</span>
                  </div>
                  <span>{timeAgo(entry.timestamp)}</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex justify-between items-center">
                <div className="font-semibold text-primary text-base">{renderPrice(entry.price)}</div>
                <button
                  className="px-4 py-2 bg-[#e31e24] text-white rounded text-sm font-medium hover:bg-[#c01a1f] hover:shadow transition-colors"
                >
                  Anfragen
                </button>
              </div>
            </div>
          ))}
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
    </div>
  );
}
