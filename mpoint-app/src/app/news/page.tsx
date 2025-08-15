"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Search, Filter, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const pageSize = 8;

  useEffect(() => {
    async function fetchNews() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        let filtered = data;
        // Filter by search
        if (search) {
          filtered = filtered.filter((n: any) =>
            n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.shortText.toLowerCase().includes(search.toLowerCase())
          );
        }
        // Filter by category
        if (filter) {
          filtered = filtered.filter((n: any) => n.category === filter);
        }
        // Sort by date desc
        filtered = filtered.sort((a: any, b: any) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
        setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
        setNews(filtered.slice((page - 1) * pageSize, page * pageSize));
      } catch (e) {
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNews();
  }, [search, filter, page]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        const cats = Array.from(new Set(data.map((n: any) => n.category).filter(Boolean)));
        setCategories(cats as string[]);
      } catch {}
    }
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#e60000]" /> News Übersicht
          </h1>
        </div>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 flex items-center bg-white rounded-lg shadow-sm px-4 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Suche nach News..."
              className="flex-1 outline-none bg-transparent text-gray-900"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="bg-white rounded-lg shadow-sm px-3 py-2 text-gray-900"
              value={filter}
              onChange={e => { setFilter(e.target.value); setPage(1); }}
            >
              <option value="">Alle Kategorien</option>
              {categories.map(cat => {
                const label = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
                return <option key={cat} value={cat}>{label}</option>;
              })}
            </select>
          </div>
        </form>
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e60000]"></div>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center text-gray-500 py-16">Keine News gefunden.</div>
        ) : (
          <div className="flex flex-col gap-8">
            {news.map(n => (
              <article key={n.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group flex md:flex-row flex-col h-64 md:h-64 min-h-0">
                {n.imageUrl && (
                  <div className="md:w-48 w-full h-64 relative flex-shrink-0">
                    <img src={n.imageUrl} alt={n.title} className="object-cover w-full h-full" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between h-full">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#e60000] transition-colors line-clamp-2">
                      {n.title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span>{new Date(n.publishDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                      {n.author && <><span>•</span><span>Von {n.author}</span></>}
                      {n.readTime && <><span>•</span><span>{n.readTime} Lesezeit</span></>}
                    </div>
                    <p className="text-gray-600 line-clamp-3 mb-2">{n.shortText}</p>
                  </div>
                  <div className="mt-2">
                    <Link href={`/news/${n.id}`} className="inline-flex items-center gap-2 text-[#e60000] font-medium hover:gap-3 transition-all">
                      Mehr erfahren <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-medium disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Zurück
          </button>
          <span className="px-3 py-1">Seite {page} von {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-medium disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Weiter
          </button>
        </div>
      </div>
    </main>
  );
}
