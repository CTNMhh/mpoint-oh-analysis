"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Search, Users, Building2, Filter, RefreshCcw, ArrowRight, Globe, Calendar } from "lucide-react";

interface CompanyTile {
  id: string;
  name: string;
  district?: string | null;
  employeeRange?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  industryTags?: string[];
  updatedAt?: string;
}

// Hilfsfunktion für ältere Einträge, die evtl. noch /uploads/ speichern
function normalizeLogo(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("/uploads/")) {
    return url.replace("/uploads/", "/api/files/");
  }
  return url;
}

export default function CompaniesGalleryPage() {
  const [items, setItems] = useState<CompanyTile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [size, setSize] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, district, size, tag]);

  useEffect(() => {
    let abort = false;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("list", "1");
        params.set("page", page.toString());
        params.set("excludeMine","1");
        if (debouncedSearch.length >= 2) params.set("search", debouncedSearch); // optional: live Suche (wenn aktiv, überschreibt list-Query im Backend – alternativ separaten Endpoint)
        if (district) params.set("district", district);
        if (size) params.set("size", size);
        if (tag) params.set("tag", tag);
        const res = await fetch(`/api/company?${params.toString()}`);
        const data = await res.json();
        if (!abort) {
          if (data.items) {
            setItems(data.items);
            setPages(data.pages);
            setTotal(data.total);
          } else if (Array.isArray(data)) {
            // Fallback falls Suche greift (search >=2)
            setItems(data as CompanyTile[]);
            setPages(1);
            setTotal(data.length);
          }
        }
      } catch {
        if (!abort) {
          setItems([]);
          setPages(1);
          setTotal(0);
        }
      } finally {
        if (!abort) setLoading(false);
      }
    }
    load();
    return () => { abort = true; };
  }, [debouncedSearch, district, size, tag, page]);

  const districts = [
    "MITTE","ALTONA","EIMSBUETTEL","NORD","WANDSBEK","BERGEDORF","HARBURG","HAFENCITY","SPEICHERSTADT","UMLAND_NORD","UMLAND_SUED"
  ];

  const sizes = ["1-9","10-49","50-99","100-249","250-499","500+"];

  const tagChips = useMemo(() => {
    const set = new Set<string>();
    items.forEach(c => c.industryTags?.forEach(t => set.add(t)));
    return Array.from(set).slice(0, 30);
  }, [items]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4 text-gray-900">
            Unternehmen entdecken
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Durchsuche alle Unternehmen der Plattform. Nutze Filter für Bezirk, Größe und Branchen-Tags.
          </p>
        </div>

        {/* Filter / Suche */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Suche (min. 2 Zeichen)
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, Beschreibung..."
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Bezirk
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-48 py-3 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              >
                <option value="">Alle</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Größe
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-40 py-3 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              >
                <option value="">Alle</option>
                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Tag
              </label>
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                list="tag-options"
                placeholder="Tag eingeben..."
                className="w-48 py-3 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[rgb(228,25,31)] focus:border-transparent"
              />
              <datalist id="tag-options">
                {tagChips.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setSearch(""); setDistrict(""); setSize(""); setTag(""); }}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
              >
                <RefreshCcw className="w-4 h-4" /> Reset
              </button>
              <div className="hidden lg:flex items-center gap-2 text-gray-400 text-sm">
                <Filter className="w-4 h-4" /> Filter aktiv
              </div>
            </div>
          </div>
          {/* Aktive Filter Anzeige */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[district && { label: district, onClear: () => setDistrict("") },
              size && { label: size, onClear: () => setSize("") },
              tag && { label: `Tag: ${tag}`, onClear: () => setTag("") }
            ].filter(Boolean).map((f: any, i) => (
              <button
                key={i}
                onClick={f.onClear}
                className="bg-[rgb(228,25,31)] text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 hover:opacity-90"
              >
                {f.label} <span className="text-white/80">×</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {loading ? "Lade..." : `${total} Unternehmen gefunden`}
          </p>
          {pages > 1 && (
            <p className="text-xs text-gray-400">
              Seite {page} / {pages}
            </p>
          )}
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-md mb-4" />
              <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
              <div className="h-4 bg-gray-100 rounded mb-4 w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-full mb-1" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
          ))}

          {!loading && items.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                  {c.logoUrl
                    ? <img src={normalizeLogo(c.logoUrl)} alt={c.name} className="w-full h-full object-contain p-1" />
                    : <Building2 className="w-7 h-7 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-[rgb(228,25,31)] transition-colors">
                    {c.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                    {c.district && <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                      <Globe className="w-3 h-3" /> {c.district}
                    </span>}
                    {c.employeeRange && <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                      <Users className="w-3 h-3" /> {c.employeeRange}
                    </span>}
                    {c.updatedAt && (
                      <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                        <Calendar className="w-3 h-3" /> {new Date(c.updatedAt).toLocaleDateString("de-DE")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {c.industryTags && c.industryTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {c.industryTags.slice(0, 5).map(t => (
                    <span
                      key={t}
                      className="text-xs bg-red-50 text-[rgb(228,25,31)] px-2 py-1 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                  {c.industryTags.length > 5 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{c.industryTags.length - 5} mehr
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <a
                  href={`/company/${c.id}`}
                  className="inline-flex items-center gap-2 text-[rgb(228,25,31)] font-medium text-sm hover:gap-3 transition-all"
                >
                  Profil ansehen <ArrowRight className="w-4 h-4" />
                </a>
                {c.websiteUrl && (
                  <a
                    href={c.websiteUrl.startsWith("http") ? c.websiteUrl : `https://${c.websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          ))}

          {!loading && items.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white border border-gray-100 rounded-2xl">
              <p className="text-gray-500">Keine Unternehmen gefunden.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white disabled:opacity-40 hover:bg-gray-100"
            >
              Zurück
            </button>
            {Array.from({ length: pages }).slice(0, 10).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-4 py-2 text-sm rounded-lg border ${
                    p === page
                      ? "bg-[rgb(228,25,31)] text-white border-[rgb(228,25,31)]"
                      : "border-gray-300 bg-white hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={page === pages}
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white disabled:opacity-40 hover:bg-gray-100"
            >
              Weiter
            </button>
          </div>
        )}
      </div>
    </main>
  );
}