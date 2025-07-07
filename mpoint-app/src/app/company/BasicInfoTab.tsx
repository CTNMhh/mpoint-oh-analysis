import React, { useState } from "react";
import { Plus, X } from "lucide-react";

interface BasicInfoTabProps {
  company: any;
  onChange: (field: string, value: any) => void;
  onArrayAdd: (field: string, value: string) => void;
  onArrayRemove: (field: string, index: number) => void;
}

export default function BasicInfoTab({ company, onChange, onArrayAdd, onArrayRemove }: BasicInfoTabProps) {
  const [newLocationAdvantage, setNewLocationAdvantage] = useState("");

  return (
    <div className="space-y-8">
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

        {/* Adresse */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Straße und Hausnummer
            </label>
            <input
              type="text"
              value={company.street}
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
              value={company.zipCode}
              onChange={(e) => onChange("zipCode", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Hamburg Bezirk */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hamburg Bezirk
          </label>
          <select
            value={company.district}
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