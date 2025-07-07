import React, { useState } from "react";
import { Plus, X } from "lucide-react";

interface GrowthTabProps {
  company: any;
  onChange: (field: string, value: any) => void;
  onArrayAdd: (field: string, value: string) => void;
  onArrayRemove: (field: string, index: number) => void;
}

export default function GrowthTab({ company, onChange, onArrayAdd, onArrayRemove }: GrowthTabProps) {
  const [newExpansionPlan, setNewExpansionPlan] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Wachstum & Strategie</h2>

        {/* Wachstumsphase und Wachstumsrate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wachstumsphase
            </label>
            <select
              value={company.growthPhase}
              onChange={(e) => onChange("growthPhase", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="STARTUP">Startup (&lt; 2 Jahre)</option>
              <option value="GROWTH">Wachstum (2-5 Jahre)</option>
              <option value="SCALING">Skalierung (5-10 Jahre)</option>
              <option value="ESTABLISHED">Etabliert (10-20 Jahre)</option>
              <option value="MATURE">Reif (&gt; 20 Jahre)</option>
              <option value="TRANSFORMATION">Transformation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jährliche Wachstumsrate (%)
            </label>
            <input
              type="number"
              min="-100"
              max="1000"
              step="0.1"
              value={company.growthRate}
              onChange={(e) => onChange("growthRate", parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Führungsstruktur und Entscheidungsgeschwindigkeit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Führungsstruktur
            </label>
            <select
              value={company.leadershipStructure}
              onChange={(e) => onChange("leadershipStructure", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="OWNER_LED">Inhabergeführt</option>
              <option value="FAMILY_BUSINESS">Familienunternehmen</option>
              <option value="PROFESSIONAL_MANAGEMENT">Fremdgeschäftsführung</option>
              <option value="PARTNERSHIP">Partnerschaft/Sozietät</option>
              <option value="COOPERATIVE">Genossenschaft</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entscheidungsgeschwindigkeit
            </label>
            <select
              value={company.decisionSpeed}
              onChange={(e) => onChange("decisionSpeed", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="VERY_FAST">Sehr schnell (1-3 Tage)</option>
              <option value="FAST">Schnell (4-7 Tage)</option>
              <option value="MODERATE">Moderat (1-2 Wochen)</option>
              <option value="SLOW">Langsam (3-4 Wochen)</option>
              <option value="VERY_SLOW">Sehr langsam (&gt; 4 Wochen)</option>
            </select>
          </div>
        </div>

        {/* Anzahl Entscheidungsträger */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anzahl Entscheidungsträger
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={company.decisionMakers}
            onChange={(e) => onChange("decisionMakers", parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
          />
        </div>

        {/* Nachhaltigkeitsfokus */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nachhaltigkeitsfokus (1-10)
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="10"
              value={company.sustainabilityFocus}
              onChange={(e) => onChange("sustainabilityFocus", parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Gering</span>
              <span className="font-medium text-[rgb(228,25,31)]">{company.sustainabilityFocus}/10</span>
              <span>Sehr hoch</span>
            </div>
          </div>
        </div>

        {/* Digitalisierungsgrad */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Digitalisierungsgrad (1-10)
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={company.digitalizationLevel}
            onChange={(e) => onChange("digitalizationLevel", parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Gering</span>
            <span className="font-medium text-[rgb(228,25,31)]">{company.digitalizationLevel}/10</span>
            <span>Sehr hoch</span>
          </div>
        </div>

        {/* IT-Budget */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IT-Budget (% vom Umsatz)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={company.itBudgetPercent ?? ""}
            onChange={(e) => onChange("itBudgetPercent", e.target.value === "" ? null : parseFloat(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            placeholder="z.B. 5"
          />
        </div>

        {/* Expansionspläne */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expansionspläne
          </label>
          <div className="flex gap-2 mb-3">
            <select
              value={newExpansionPlan}
              onChange={(e) => setNewExpansionPlan(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
            >
              <option value="">Plan wählen</option>
              <option value="NEW_LOCATIONS">Neue Standorte</option>
              <option value="NEW_PRODUCTS">Neue Produkte</option>
              <option value="NEW_MARKETS">Neue Märkte</option>
              <option value="DIGITALIZATION">Digitalisierung</option>
              <option value="ACQUISITIONS">Akquisitionen</option>
              <option value="INTERNATIONAL">Internationalisierung</option>
            </select>
            <button
              type="button"
              onClick={() => {
                if (newExpansionPlan) {
                  onArrayAdd("expansionPlans", newExpansionPlan);
                  setNewExpansionPlan("");
                }
              }}
              className="px-4 py-2 bg-[rgb(228,25,31)] text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {company.expansionPlans.map((plan: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
              >
                {plan === "NEW_LOCATIONS" && "Neue Standorte"}
                {plan === "NEW_PRODUCTS" && "Neue Produkte"}
                {plan === "NEW_MARKETS" && "Neue Märkte"}
                {plan === "DIGITALIZATION" && "Digitalisierung"}
                {plan === "ACQUISITIONS" && "Akquisitionen"}
                {plan === "INTERNATIONAL" && "Internationalisierung"}
                <button
                  type="button"
                  onClick={() => onArrayRemove("expansionPlans", index)}
                  className="text-green-500 hover:text-red-500"
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