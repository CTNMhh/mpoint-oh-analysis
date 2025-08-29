"use client";

import React from "react";
import FaktorenListenElementGraph from "./FaktorenListenElementGraph";
import { useTemplate } from "./TemplateContext";
import { Plus } from "lucide-react";

export type Faktor = {
  id: string;
  name: string;
  beschreibung: string;
  quelle: string;
  kategorie?: string;
  werte?: number[]; // optional, can be overridden by dummy inside
};

type Props = {
  faktor: Faktor;
};

export default function FaktorListenElement({ faktor }: Props) {
  const { addFactor, hasFactor, isReadonly } = useTemplate();
  // Dummy values for the graph; if faktor.werte provided, use them, else generate consistent dummy
  const values = React.useMemo(() => {
    if (faktor.werte && faktor.werte.length > 0) return faktor.werte;
    // deterministic pseudo-random based on id to keep stable between renders
    const seed = Array.from(faktor.id).reduce((a, c) => a + c.charCodeAt(0), 0);
    const n = 12;
    const arr: number[] = [];
    let val = seed % 100;
    for (let i = 0; i < n; i++) {
      val = (val * 9301 + 49297) % 233280; // LCG
      arr.push(50 + Math.round(((val / 233280) - 0.5) * 60));
    }
    return arr;
  }, [faktor.id, faktor.werte]);

  const labels = React.useMemo(() =>
    ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
  []);

  return (
    <article className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-5 transition">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">{faktor.name}</h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{faktor.beschreibung}</p>
          <div className="mt-2 text-xs text-gray-500">
            Quelle: <span className="font-medium text-gray-700">{faktor.quelle}</span>
            {faktor.kategorie ? (
              <>
                {" "}• Kategorie: <span className="text-gray-700">{faktor.kategorie}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="sm:w-80 w-full">
          <FaktorenListenElementGraph values={values} labels={labels} />
        </div>
      </div>
      {!isReadonly && (
        <div className="mt-3 flex justify-end">
          {hasFactor(faktor.name) ? (
            <button
              type="button"
              disabled
              className="px-3 py-1.5 text-xs rounded-full bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              Bereits hinzugefügt
            </button>
          ) : (
            <button
              type="button"
              onClick={() => addFactor(faktor.name)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-full bg-[rgb(228,25,31)] text-white hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" /> Hinzufügen
            </button>
          )}
        </div>
      )}
    </article>
  );
}
