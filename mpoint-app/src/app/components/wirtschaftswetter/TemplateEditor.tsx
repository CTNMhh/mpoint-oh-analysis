"use client";

import React from "react";
import Wirtschaftsmeter from "./Wirtschaftsmeter";
import { X } from "lucide-react";
import { useTemplate, TEMPLATE_NEW } from "./TemplateContext";

// Helper to generate stable pseudo-random factor values per region+factor
function factorValue(region: string, factorName: string): number {
  const seedStr = `${region}:${factorName}`;
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  let val = seed % 1000;
  // simple LCG to spread values
  val = (val * 9301 + 49297) % 233280;
  const norm = val / 233280; // 0..1
  return Math.round(20 + norm * 70); // range ~20..90 to avoid extremes
}

export default function TemplateEditor() {
  const {
    templates,
    selected,
    setSelected,
    name,
    setName,
    rows,
    isReadonly: readonly,
    removeRow,
    updateWeight,
  updateMode,
  getFactorValues,
  score,
  } = useTemplate();

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Template-Editor</h3>
        <p className="text-xs text-gray-500 mt-1">Erstelle oder wähle ein Template und simuliere den Score mit dem Wirtschaftsmeter.</p>
      </div>

      {/* Controls */}
      <div className="mb-4">
        <label htmlFor="te-template" className="block text-xs text-gray-500 mb-1">Template</label>
        <select
          id="te-template"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          {templates.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
          <option value={TEMPLATE_NEW}>Neues Template</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-gray-500 mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          readOnly={readonly}
          placeholder="Name des Templates"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Overview Meter */}
      <div className="mb-4">
        <Wirtschaftsmeter score={score} description="Aktueller Template-Score" />
      </div>

      {/* Factors list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">Faktoren</h4>
          {/* add via FaktorenListe; no direct add button here anymore */}
        </div>

        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          {rows.map((row, idx) => {
            const vals = getFactorValues(row.name);
            return (
              <div key={idx} className="p-3 bg-white">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    disabled={readonly}
                    className="mt-0.5 p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                    aria-label="Faktor entfernen"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-gray-900 truncate">{row.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Wert</span>
                        <div className="inline-flex rounded-md overflow-hidden border border-gray-200">
                          <button
                            type="button"
                            disabled={readonly}
                            onClick={() => updateMode(idx, "latest")}
                            className={`px-2 py-1 text-xs ${row.mode === "latest" ? "bg-[rgb(228,25,31)] text-white" : "bg-white text-gray-700"}`}
                          >
                            Aktuell
                          </button>
                          <button
                            type="button"
                            disabled={readonly}
                            onClick={() => updateMode(idx, "avg")}
                            className={`px-2 py-1 text-xs ${row.mode === "avg" ? "bg-[rgb(228,25,31)] text-white" : "bg-white text-gray-700"}`}
                          >
                            Durchschnitt
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {row.mode === "latest" ? "Aktuell" : "Durchschnitt"}: {row.mode === "latest" ? vals.latest : vals.avg}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Gewichtung</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          min="0"
                          value={row.weight}
                          disabled={readonly}
                          onChange={(e) => updateWeight(idx, Number(e.target.value))}
                          className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div className="p-4 text-sm text-gray-500">Keine Faktoren im Template.</div>
          )}
        </div>
      </div>
    </div>
  );
}
