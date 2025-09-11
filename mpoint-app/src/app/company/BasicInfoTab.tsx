import React, { useState, useCallback } from "react";
import { Plus, X, Upload, Loader2, Image as ImageIcon } from "lucide-react";

interface BasicInfoTabProps {
  company: any;
  onChange: (field: string, value: any) => void;
  onArrayAdd: (field: string, value: string) => void;
  onArrayRemove: (field: string, index: number) => void;
}

export default function BasicInfoTab({ company, onChange, onArrayAdd, onArrayRemove }: BasicInfoTabProps) {
  const [newLocationAdvantage, setNewLocationAdvantage] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [showLogoReplace, setShowLogoReplace] = useState(false);

  const uploadLogo = async (file: File) => {
    setLogoError(null);
    if (!file.type.startsWith("image/")) {
      setLogoError("Nur Bilddateien erlaubt.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Max. 2 MB erlaubt.");
      return;
    }
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload fehlgeschlagen");
      }
      const { url } = await res.json();
      // Route liefert /api/files/xyz – für direkte Auslieferung auch /uploads/ nutzbar:
   
      onChange("logoUrl", url);
      // Nach erfolgreichem Upload Uploader wieder ausblenden
      setShowLogoReplace(false);
    } catch (e: any) {
      setLogoError(e.message || "Unbekannter Fehler");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogo(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadLogo(file);
  }, []);

  const prevent = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-8">
      {/* Logo Upload */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo & Darstellung</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <p className="text-sm text-gray-600">
              Lade ein Firmenlogo hoch (PNG, JPG, SVG – max. 2 MB). Wird auf Profil- & Match-Karten angezeigt.
            </p>
            {company.logoUrl && (
              <div className="mt-4 relative group">
                <img
                  src={company.logoUrl}
                  alt="Logo Vorschau"
                  className="h-28 w-28 object-contain bg-white border rounded-xl p-2 shadow-sm"
                />
                {/* X ersetzt: öffnet jetzt den Replace-Uploader statt direkt zu löschen */}
                <button
                  type="button"
                  onClick={() => setShowLogoReplace(true)}
                  className="absolute -top-2 -right-2 bg-[rgb(228,25,31)] text-white rounded-full p-1 shadow hover:bg-red-700 transition"
                  title="Logo ersetzen"
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Optional echtes Entfernen (Papierkorb) – falls gewünscht */}
                {/* 
                <button
                  type="button"
                  onClick={() => onChange('logoUrl','')}
                  className="absolute -bottom-2 -right-2 bg-gray-600 text-white rounded-full p-1 shadow hover:bg-gray-700 transition"
                  title="Logo entfernen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                */}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            {/* Uploader anzeigen wenn kein Logo ODER wenn Replacement aktiv */}
            {(!company.logoUrl || showLogoReplace) && (
              <div className="space-y-4">
                <label
                  onDragOver={prevent}
                  onDragEnter={prevent}
                  onDrop={handleDrop}
                  className="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 bg-gray-50 hover:bg-gray-100 cursor-pointer text-center transition"
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoInput}
                    disabled={logoUploading}
                  />
                  {logoUploading ? (
                    <Loader2 className="w-8 h-8 text-[rgb(228,25,31)] animate-spin" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {logoUploading ? "Lade hoch..." : "Logo wählen oder hierher ziehen"}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG / JPG / SVG – max. 2 MB
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-[rgb(228,25,31)] text-white text-xs font-semibold rounded-lg shadow hover:bg-red-700 transition">
                    <Upload className="w-4 h-4" /> Datei auswählen
                  </span>
                </label>
                {company.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setShowLogoReplace(false)}
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-[rgb(228,25,31)] text-white text-xs font-semibold rounded-lg shadow hover:bg-red-700 transition"
                  >
                    <X className="w-3 h-3" />
                    Abbrechen
                  </button>
                )}
              </div>
            )}
            {logoError && <p className="mt-2 text-sm text-red-600">{logoError}</p>}
            {/* Kein zusätzlicher Text-Button mehr – X Icon übernimmt die Funktion */}
          </div>
        </div>
      </section>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Grunddaten</h2>

        {/* Unternehmensname und Rechtsform */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unternehmensname *
            </label>
            <input
              type="text"
              value={company.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechtsform
            </label>
            <select
              value={company.legalForm}
              onChange={(e) => onChange("legalForm", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="">Bitte wählen</option>
              <option value="GmbH">GmbH</option>
              <option value="UG">UG (haftungsbeschränkt)</option>
              <option value="AG">AG</option>
              <option value="KG">KG</option>
              <option value="OHG">OHG</option>
              <option value="Einzelunternehmen">Einzelunternehmen</option>
              <option value="GbR">GbR</option>
              <option value="eG">eG</option>
            </select>
          </div>
        </div>

        {/* Gründungsjahr und Handelsregisternummer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gründungsjahr *
            </label>
            <input
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              value={company.foundedYear}
              onChange={(e) => onChange("foundedYear", parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Handelsregisternummer
            </label>
            <input
              type="text"
              value={company.registrationNumber}
              onChange={(e) => onChange("registrationNumber", e.target.value)}
              placeholder="z.B. HRB 123456"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Mitarbeiteranzahl und Umsatz */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anzahl Mitarbeiter *
            </label>
            <input
              type="number"
              min="1"
              value={company.employeeCount}
              onChange={(e) => onChange("employeeCount", parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jahresumsatz (€)
            </label>
            <input
              type="number"
              min="0"
              value={company.annualRevenue}
              onChange={(e) => onChange("annualRevenue", parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Block 1: Geschäftsführer | Webseite */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Geschäftsführer
            </label>
            <input
              type="text"
              value={company.managingDirector || ""}
              onChange={(e) => onChange("managingDirector", e.target.value)}
              placeholder="Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webseite
            </label>
            <input
              type="url"
              value={company.websiteUrl || ""}
              onChange={(e) => onChange("websiteUrl", e.target.value)}
              placeholder="https://www.example.de"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Block 2: Kontakt E-Mail | Telefon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kontakt E-Mail
            </label>
            <input
              type="email"
              value={company.contactEmail || ""}
              onChange={(e) => onChange("contactEmail", e.target.value)}
              placeholder="kontakt@firma.de"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={company.contactPhone || ""}
              onChange={(e) => onChange("contactPhone", e.target.value)}
              placeholder="+49 ..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Block 3: Straße und Hausnummer | PLZ | Hamburg Bezirk */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Straße und Hausnummer
            </label>
            <input
              type="text"
              value={company.street || ""}
              onChange={(e) => onChange("street", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PLZ
            </label>
            <input
              type="text"
              value={company.zipCode || ""}
              onChange={(e) => onChange("zipCode", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hamburg Bezirk
            </label>
            <select
              value={company.district || ""}
              onChange={(e) => onChange("district", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="">Bitte wählen</option>
              <option value="MITTE">Hamburg-Mitte</option>
              <option value="ALTONA">Altona</option>
              <option value="EIMSBUETTEL">Eimsbüttel</option>
              <option value="NORD">Hamburg-Nord</option>
              <option value="WANDSBEK">Wandsbek</option>
              <option value="BERGEDORF">Bergedorf</option>
              <option value="HARBURG">Harburg</option>
              <option value="HAFENCITY">HafenCity</option>
              <option value="SPEICHERSTADT">Speicherstadt</option>
              <option value="UMLAND_NORD">Umland Nord</option>
              <option value="UMLAND_SUED">Umland Süd</option>
            </select>
          </div>
        </div>

        {/* Standortvorteile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Standortvorteile
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newLocationAdvantage}
              onChange={(e) => setNewLocationAdvantage(e.target.value)}
              placeholder="z.B. Hafennähe, Autobahnanbindung"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onArrayAdd("locationAdvantages", newLocationAdvantage);
                  setNewLocationAdvantage("");
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                onArrayAdd("locationAdvantages", newLocationAdvantage);
                setNewLocationAdvantage("");
              }}
              className="px-4 py-2 bg-[rgb(228,25,31)] text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {company.locationAdvantages.map((advantage: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {advantage}
                <button
                  type="button"
                  onClick={() => onArrayRemove("locationAdvantages", index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}