import React from "react";

interface BusinessModelTabProps {
  company: any;
  onChange: (field: string, value: any) => void;
  onArrayAdd: (field: string, value: string) => void;
  onArrayRemove: (field: string, index: number) => void;
}

export default function BusinessModelTab({ company, onChange, onArrayAdd, onArrayRemove }: BusinessModelTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Geschäftsmodell</h2>

        {/* Kundentyp und Marktreichweite */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kundentyp *
            </label>
            <select
              value={company.customerType}
              onChange={(e) => onChange("customerType", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              required
            >
              <option value="B2B">B2B (Business to Business)</option>
              <option value="B2C">B2C (Business to Consumer)</option>
              <option value="B2B2C">B2B2C (Business to Business to Consumer)</option>
              <option value="B2G">B2G (Business to Government)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marktreichweite
            </label>
            <select
              value={company.marketReach}
              onChange={(e) => onChange("marketReach", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="LOCAL">Lokal (Hamburg)</option>
              <option value="REGIONAL">Regional (Norddeutschland)</option>
              <option value="NATIONAL">National (Deutschland)</option>
              <option value="EU">Europa</option>
              <option value="GLOBAL">Global</option>
            </select>
          </div>
        </div>

        {/* Exportquote und Saisonalität */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exportquote (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={company.exportQuota}
              onChange={(e) => onChange("exportQuota", parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Saisonalität
            </label>
            <select
              value={company.seasonality}
              onChange={(e) => onChange("seasonality", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="NONE">Keine</option>
              <option value="LOW">Gering</option>
              <option value="MEDIUM">Mittel</option>
              <option value="HIGH">Hoch</option>
              <option value="EXTREME">Extrem</option>
            </select>
          </div>
        </div>

        {/* Branchenbeschreibung */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branchenbeschreibung
          </label>
          <textarea
            value={company.branchDescription}
            onChange={(e) => onChange("branchDescription", e.target.value)}
            rows={4}
            placeholder="Beschreiben Sie Ihre Branche und Ihr Geschäftsfeld..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}