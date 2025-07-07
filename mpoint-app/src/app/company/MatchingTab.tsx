import React, { useState } from "react";
import { Plus, X } from "lucide-react";

interface MatchingTabProps {
  company: any;
  onChange: (field: string, value: any) => void;
  onArrayAdd: (field: string, value: string) => void;
  onArrayRemove: (field: string, index: number) => void;
}

export default function MatchingTab({ company, onChange, onArrayAdd, onArrayRemove }: MatchingTabProps) {
  const [newPainPoint, setNewPainPoint] = useState("");
  const [newSearching, setNewSearching] = useState("");
  const [newOffering, setNewOffering] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Matching-Präferenzen</h2>

        {/* Pain Points */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aktuelle Herausforderungen
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newPainPoint}
              onChange={(e) => setNewPainPoint(e.target.value)}
              placeholder="z.B. Fachkräftemangel, Digitalisierung"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onArrayAdd("painPoints", newPainPoint);
                  setNewPainPoint("");
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                onArrayAdd("painPoints", newPainPoint);
                setNewPainPoint("");
              }}
              className="px-4 py-2 bg-[rgb(228,25,31)] text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {company.painPoints.map((point: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
              >
                {point}
                <button
                  type="button"
                  onClick={() => onArrayRemove("painPoints", index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Was wird gesucht */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Was wird gesucht
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSearching}
              onChange={(e) => setNewSearching(e.target.value)}
              placeholder="z.B. IT-Dienstleister, Lieferanten, Kooperationspartner"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onArrayAdd("searchingFor", newSearching);
                  setNewSearching("");
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                onArrayAdd("searchingFor", newSearching);
                setNewSearching("");
              }}
              className="px-4 py-2 bg-[rgb(228,25,31)] text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {company.searchingFor.map((item: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onArrayRemove("searchingFor", index)}
                  className="text-blue-500 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Was wird angeboten */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Was wird angeboten
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newOffering}
              onChange={(e) => setNewOffering(e.target.value)}
              placeholder="z.B. Beratung, Produkte, Services"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onArrayAdd("offeringTo", newOffering);
                  setNewOffering("");
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                onArrayAdd("offeringTo", newOffering);
                setNewOffering("");
              }}
              className="px-4 py-2 bg-[rgb(228,25,31)] text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {company.offeringTo.map((item: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onArrayRemove("offeringTo", index)}
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