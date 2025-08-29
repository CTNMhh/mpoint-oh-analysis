"use client";

import React, { useMemo, useState } from "react";
import FaktorListenElement, { Faktor } from "./FaktorListenElement";
import { Search, SlidersHorizontal } from "lucide-react";

// Dummy data for now
const ALL_FAKTOREN: Faktor[] = Array.from({ length: 23 }).map((_, i) => ({
  id: String(i + 1),
  name: `Faktor ${i + 1}`,
  beschreibung:
    "Kurzbeschreibung des Faktors als Platzhaltertext. Dies wird später durch echte Inhalte ersetzt.",
  quelle: i % 3 === 0 ? "Destatis" : i % 3 === 1 ? "Bundesbank" : "Ifo Institut",
  kategorie: ["Konjunktur", "Arbeitsmarkt", "Finanzen"][i % 3],
  werte: Array.from({ length: 12 }, () => Math.round(Math.random() * 100)),
}));

const PAGE_SIZE = 5;

export default function FaktorenListe() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string | "alle">("alle");
  const [page, setPage] = useState(1);

  const kategorien = useMemo(() => {
    const set = new Set<string>();
    ALL_FAKTOREN.forEach((f) => f.kategorie && set.add(f.kategorie));
    return Array.from(set);
  }, []);

  const gefiltert = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_FAKTOREN.filter((f) => {
      const matchQuery = !q ||
        f.name.toLowerCase().includes(q) ||
        f.beschreibung.toLowerCase().includes(q) ||
        f.quelle.toLowerCase().includes(q);
      const matchFilter = filter === "alle" || f.kategorie === filter;
      return matchQuery && matchFilter;
    });
  }, [query, filter]);

  const total = gefiltert.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = gefiltert.slice(start, start + PAGE_SIZE);

  function goTo(p: number) {
    setPage(Math.max(1, Math.min(totalPages, p)));
  }

  // Reset to first page when filters change
  React.useEffect(() => setPage(1), [query, filter]);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suche nach Name, Beschreibung, Quelle..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(228,25,31)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="alle">Alle Kategorien</option>
              {kategorien.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {slice.map((f) => (
          <FaktorListenElement key={f.id} faktor={f} />
        ))}
        {slice.length === 0 && (
          <div className="text-sm text-gray-500">Keine Ergebnisse.</div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {total === 0 ? "0" : `${start + 1}-${Math.min(start + PAGE_SIZE, total)}`} von {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            Zurück
          </button>
          <div className="text-sm">
            Seite {currentPage} / {totalPages}
          </div>
          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  );
}
