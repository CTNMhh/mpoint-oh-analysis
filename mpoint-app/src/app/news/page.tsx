"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../components/ui/Button";
import { BookOpen, Search, Filter, ArrowLeft, ArrowRight } from "lucide-react";
import { MoreLink } from "../components/ui/MoreLink";

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
          filtered = filtered.filter(
            (n: any) =>
              n.title.toLowerCase().includes(search.toLowerCase()) ||
              n.shortText.toLowerCase().includes(search.toLowerCase())
          );
        }
        // Filter by category
        if (filter) {
          filtered = filtered.filter((n: any) => n.category === filter);
        }
        // Sort by date desc
        filtered = filtered.sort(
          (a: any, b: any) =>
            new Date(b.publishDate).getTime() -
            new Date(a.publishDate).getTime()
        );
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
        const cats = Array.from(
          new Set(data.map((n: any) => n.category).filter(Boolean))
        );
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-[#e60000]" /> News Übersicht
          </h1>
          <p className="text-gray-600">
            Hier finden Sie alle aktuellen News und Fachartikel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-0">
          <form onSubmit={handleSearch} className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">News</h3>
                <BookOpen className="w-6 h-6 text-[#e60000]" />
              </div>
              <div className="flex flex-col md:flex-row gap-4 mb-5 items-center">
                <div className="flex-1 flex items-center bg-white rounded-lg shadow-sm px-4 py-2">
                  <Search className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Suche nach News..."
                    className="flex-1 outline-none bg-transparent text-gray-900"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-3 focus-within:outline-none focus-within:ring-2 focus-within:ring-red-300">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    className="pe-3 py-2 text-gray-900"
                    id="category-filter"
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">Alle Kategorien</option>
                    {categories.map((cat) => {
                      const label =
                        cat.charAt(0).toUpperCase() +
                        cat.slice(1).toLowerCase();
                      return (
                        <option key={cat} value={cat}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e60000]"></div>
                </div>
              ) : news.length === 0 ? (
                <div className="text-center text-gray-500 py-16">
                  Keine News gefunden.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {news.map((n) => (
                    <article
                      key={n.id}
                      className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-shadow cursor-pointer overflow-hidden group flex md:flex-row flex-col h-auto md:h-64 min-h-0 hover:shadow-md"
                    >
                      {n.imageUrl && (
                        <div className="md:w-48 w-full h-64 relative flex-shrink-0">
                          <img
                            src={n.imageUrl}
                            alt={n.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col justify-between h-full">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#e60000] transition-colors line-clamp-2">
                            {n.title}
                          </h2>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <span>
                              {new Date(n.publishDate).toLocaleDateString(
                                "de-DE",
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            {n.author && (
                              <>
                                <span>•</span>
                                <span>Von {n.author}</span>
                              </>
                            )}
                            {n.readTime && (
                              <>
                                <span>•</span>
                                <span>{n.readTime} Lesezeit</span>
                              </>
                            )}
                          </div>
                          <p className="text-gray-600 line-clamp-3 mb-2">
                            {n.shortText}
                          </p>
                        </div>
                        <div className="mt-6 text-center">
                          <MoreLink href={`/news/${n.id}`} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <Button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    variant="secondary"
                    icon={ArrowLeft}
                  >
                    Zurück
                  </Button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <Button
                      key={idx + 1}
                      variant={page === idx + 1 ? "primary" : "secondary"}
                      onClick={() => setPage(idx + 1)}
                    >
                      {idx + 1}
                    </Button>
                  ))}
                  <Button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    variant="secondary"
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Weiter
                  </Button>
                </div>
              )}
            </div>
          </form>

          {/* Articles Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Neue Fachartikel
              </h3>
              <BookOpen className="w-6 h-6 text-[#e60000]" />
            </div>

            <div className="space-y-4">
              <ArticleItem
                category="Digitalisierung"
                title="KI-Einsatz im deutschen Mittelstand: Chancen und Herausforderungen"
                author="Dr. Thomas Schmidt"
                readTime="5 Min."
                onClick={() => alert("Artikel: KI im Mittelstand")}
              />
              <ArticleItem
                category="Nachhaltigkeit"
                title="Nachhaltige Lieferketten aufbauen: Ein Leitfaden"
                author="Prof. Julia Müller"
                readTime="8 Min."
                onClick={() => alert("Artikel: Nachhaltige Lieferketten")}
              />
              <ArticleItem
                category="Management"
                title="Remote Leadership: Best Practices für hybride Teams"
                author="Lisa Weber"
                readTime="6 Min."
                onClick={() => alert("Artikel: Remote Leadership")}
              />
            </div>

            <div className="mt-4 text-center">
              <MoreLink href="#articles">
                Alle Artikel anzeigen
              </MoreLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  function ArticleItem({
    category,
    title,
    author,
    readTime,
    onClick,
  }: {
    category: string;
    title: string;
    author: string;
    readTime: string;
    onClick: () => void;
  }) {
    const getCategoryColor = (cat: string) => {
      switch (cat) {
        case "Digitalisierung":
          return "bg-blue-100 text-blue-800";
        case "Nachhaltigkeit":
          return "bg-green-100 text-green-800";
        case "Management":
          return "bg-purple-100 text-purple-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <div
        onClick={onClick}
        className="rounded-lg bg-white hover:bg-gray-50 cursor-pointer group border border-gray-200 hover:shadow-md p-4 transition-all"
      >
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
            category
          )} mb-2`}
        >
          {category}
        </span>
        <h4 className="font-semibold text-gray-900 group-hover:text-[#e60000] transition-colors mb-2">
          {title}
        </h4>
        <div className="text-sm text-gray-500">
          Von {author} • {readTime} Lesezeit
        </div>
      </div>
    );
  }
}
