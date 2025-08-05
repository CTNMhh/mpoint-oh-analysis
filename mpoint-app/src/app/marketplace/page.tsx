"use client";

// Diese Datei rendert die statische Dummy-Marktplatzseite aus marktplatztailwind.tml
// und bindet sie als React-Komponente in Next.js ein.
// Tailwind wird über PostCSS eingebunden, nicht per CDN.

import { useState } from "react";

export default function MarketplaceDummy() {
  const [showModal, setShowModal] = useState(false);

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
                {/* Projektbeschreibung */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectDescription">
                    Projektbeschreibung <span className="text-primary">*</span>
                  </label>
                  <textarea
                    id="projectDescription"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-y min-h-24 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Beschreiben Sie Ihr Projekt detailliert..."
                    required
                  ></textarea>
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
                {/* Budget */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="priceType" value="fixed" defaultChecked className="text-primary" />
                      Festpreis
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="priceType" value="hourly" className="text-primary" />
                      Stundensatz
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="priceType" value="negotiable" className="text-primary" />
                      Verhandelbar
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      id="priceMin"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="Von"
                      min="0"
                      step="0.01"
                    />
                    <span className="text-gray-500">bis</span>
                    <input
                      type="number"
                      id="priceMax"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="Bis"
                      min="0"
                      step="0.01"
                    />
                    <span className="text-gray-500">€</span>
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
                {/* Checkboxes */}
                <div className="mb-4">
                  <label className="flex items-center gap-3 mb-4 cursor-pointer">
                    <input type="checkbox" id="isUrgent" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                    <span className="text-sm">Als dringend markieren</span>
                  </label>
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
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <input
              type="text"
              className="flex-1 px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Projekte, Dienstleistungen oder Produkte suchen..."
              id="searchInput"
            />
            <button className="bg-[#e31e24] text-white px-6 py-3 rounded-md font-medium hover:bg-[#c01a1f] transition-colors shadow" id="searchBtn">
              Suchen
            </button>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="filter-tab bg-primary text-white px-4 py-2 rounded-full text-sm cursor-pointer transition-all border border-primary">Alle</div>
            <div className="filter-tab bg-white text-gray-700 px-4 py-2 rounded-full text-sm cursor-pointer transition-all border border-gray-300 hover:border-primary">Projekte suchen</div>
            <div className="filter-tab bg-white text-gray-700 px-4 py-2 rounded-full text-sm cursor-pointer transition-all border border-gray-300 hover:border-primary">Anbieten</div>
            <div className="filter-tab bg-white text-gray-700 px-4 py-2 rounded-full text-sm cursor-pointer transition-all border border-gray-300 hover:border-primary">Meine</div>
            <div className="filter-tab bg-white text-gray-700 px-4 py-2 rounded-full text-sm cursor-pointer transition-all border border-gray-300 hover:border-primary">Dienstleistung</div>
            <div className="filter-tab bg-white text-gray-700 px-4 py-2 rounded-full text-sm cursor-pointer transition-all border border-gray-300 hover:border-primary">Produkt</div>
            <div className="filter-tab bg-white text-gray-700 px-4 py-2 rounded-full text-sm cursor-pointer transition-all border border-gray-300 hover:border-primary">Digitalisierung</div>
            <div className="filter-tab bg-white text-gray-700 px-4 py-2 rounded-full text-sm cursor-pointer transition-all border border-gray-300 hover:border-primary">Nachhaltigkeit</div>
            <div className="filter-tab bg-white text-gray-700 px-4 py-2 rounded-full text-sm cursor-pointer transition-all border border-gray-300 hover:border-primary">Management</div>
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
          <div className="text-gray-600 text-sm" id="resultsCount">47 Ergebnisse gefunden</div>
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
          {/* Dienstleistung Card */}
          <div className="result-card bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="card-category bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">DIENSTLEISTUNG</span>
                <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs font-medium">Dringend</span>
              </div>
              <h3 className="font-semibold text-base mb-2 text-gray-900">Website-Relaunch gesucht</h3>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                Wir suchen ein Team für Webentwicklung & Design. Moderne, responsive Website mit CMS-Integration gewünscht.
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">TM</div>
                  <span>Thomas Müller</span>
                </div>
                <span>vor 2 Stunden</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-between items-center">
              <div className="font-semibold text-primary text-base">€ 5.000 - 15.000</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-[#e31e24] text-[#e31e24] bg-white rounded text-xs hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors">Details</button>
                <button className="px-3 py-1 bg-[#e31e24] text-white rounded text-xs hover:bg-[#c01a1f] hover:shadow transition-colors">Anbieten</button>
              </div>
            </div>
          </div>
          {/* Produkt Card */}
          <div className="result-card bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="card-category bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">PRODUKT</span>
                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">Verfügbar</span>
              </div>
              <h3 className="font-semibold text-base mb-2 text-gray-900">Büromöbel – Großabnahme</h3>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                Preiswerte Büromöbel für Startups - jetzt anbieten. Hochwertige Schreibtische, Stühle und Schränke.
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">JS</div>
                  <span>Julia Schmidt</span>
                </div>
                <span>vor 1 Tag</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-between items-center">
              <div className="font-semibold text-primary text-base">ab € 299</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-[#e31e24] text-[#e31e24] bg-white rounded text-xs hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors">Katalog</button>
                <button className="px-3 py-1 bg-[#e31e24] text-white rounded text-xs hover:bg-[#c01a1f] hover:shadow transition-colors">Anfragen</button>
              </div>
            </div>
          </div>
          {/* Digitalisierung Card */}
          <div className="result-card bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="card-category bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">DIGITALISIERUNG</span>
              </div>
              <h3 className="font-semibold text-base mb-2 text-gray-900">KI-Einsatz im deutschen Mittelstand: Chancen und Herausforderungen</h3>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                Beratung zur Implementierung von KI-Lösungen und Automatisierungsprozesse für mittelständische Unternehmen.
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">TS</div>
                  <span>Dr. Thomas Schmidt</span>
                </div>
                <span>vor 3 Tagen</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-between items-center">
              <div className="font-semibold text-primary text-base">€ 150/Std</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-[#e31e24] text-[#e31e24] bg-white rounded text-xs hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors">Profil</button>
                <button className="px-3 py-1 bg-[#e31e24] text-white rounded text-xs hover:bg-[#c01a1f] hover:shadow transition-colors">Kontakt</button>
              </div>
            </div>
          </div>
          {/* Nachhaltigkeit Card */}
          <div className="result-card bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="card-category bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">NACHHALTIGKEIT</span>
              </div>
              <h3 className="font-semibold text-base mb-2 text-gray-900">Nachhaltige Lieferketten aufbauen: Ein Leitfaden</h3>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                Strategieberatung für umweltfreundliche und sozial verantwortliche Beschaffungsprozesse in Ihrem Unternehmen.
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">JM</div>
                  <span>Prof. Julia Müller</span>
                </div>
                <span>vor 5 Tagen</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-between items-center">
              <div className="font-semibold text-primary text-base">Auf Anfrage</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-[#e31e24] text-[#e31e24] bg-white rounded text-xs hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors">Mehr Info</button>
                <button className="px-3 py-1 bg-[#e31e24] text-white rounded text-xs hover:bg-[#c01a1f] hover:shadow transition-colors">Anfragen</button>
              </div>
            </div>
          </div>
          {/* Management Card */}
          <div className="result-card bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="card-category bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">MANAGEMENT</span>
              </div>
              <h3 className="font-semibold text-base mb-2 text-gray-900">Remote Leadership: Best Practices für hybride Teams</h3>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                Schulungen und Workshops für Führungskräfte zur effektiven Leitung verteilter Teams in der neuen Arbeitswelt.
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">LW</div>
                  <span>Lisa Weber</span>
                </div>
                <span>vor 1 Woche</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-between items-center">
              <div className="font-semibold text-primary text-base">€ 1.200/Tag</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-[#e31e24] text-[#e31e24] bg-white rounded text-xs hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors">Workshop</button>
                <button className="px-3 py-1 bg-[#e31e24] text-white rounded text-xs hover:bg-[#c01a1f] hover:shadow transition-colors">Buchen</button>
              </div>
            </div>
          </div>
          {/* ERP Software Card */}
          <div className="result-card bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="card-category bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">PRODUKT</span>
              </div>
              <h3 className="font-semibold text-base mb-2 text-gray-900">ERP-Software für KMU</h3>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                Maßgeschneiderte Enterprise Resource Planning Lösung für kleine und mittlere Unternehmen. Cloud-basiert und skalierbar.
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">MK</div>
                  <span>Michael Klein</span>
                </div>
                <span>vor 2 Wochen</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-between items-center">
              <div className="font-semibold text-primary text-base">ab € 99/Monat</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-[#e31e24] text-[#e31e24] bg-white rounded text-xs hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors">Demo</button>
                <button className="px-3 py-1 bg-[#e31e24] text-white rounded text-xs hover:bg-[#c01a1f] hover:shadow transition-colors">Testen</button>
              </div>
            </div>
          </div>
        </div>
        {/* Pagination */}
        <div className="flex justify-center items-center gap-2">
          <button className="px-3 py-2 border border-[#e31e24] bg-white text-[#e31e24] rounded text-sm font-medium hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors">← Zurück</button>
          <button className="px-3 py-2 bg-[#e31e24] text-white border border-[#e31e24] rounded text-sm font-medium hover:bg-[#c01a1f] hover:shadow transition-colors">1</button>
          <button className="px-3 py-2 border border-[#e31e24] bg-white text-[#e31e24] rounded text-sm font-medium hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors">2</button>
          <button className="px-3 py-2 border border-[#e31e24] bg-white text-[#e31e24] rounded text-sm font-medium hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors">3</button>
          <button className="px-3 py-2 border border-[#e31e24] bg-white text-[#e31e24] rounded text-sm font-medium hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors">4</button>
          <button className="px-3 py-2 border border-[#e31e24] bg-white text-[#e31e24] rounded text-sm font-medium hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors">5</button>
          <button className="px-3 py-2 border border-[#e31e24] bg-white text-[#e31e24] rounded text-sm font-medium hover:bg-[#e31e24] hover:text-white hover:shadow transition-colors">Weiter →</button>
        </div>
      </div>
    </div>
  );
}
