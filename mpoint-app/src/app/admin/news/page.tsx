"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Switch } from "@headlessui/react";

interface News {
  id: string;
  title: string;
  subtitle?: string;
  shortText: string;
  longText: string;
  imageUrl?: string;
  author?: string;
  category: string;
  tags: string[];
  publishDate: string;
  isPublished: boolean;
  viewCount: number;
  readTime?: string;
}

export default function AdminNewsListPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string>("publishDate");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      const res = await fetch("/api/admin/news");
      if (res.ok) {
        setNewsList(await res.json());
      }
      setLoading(false);
    }
    fetchNews();
  }, []);

  async function togglePublish(newsId: string, current: boolean) {
    setActionLoading(true);
    await fetch(`/api/admin/news/${newsId}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !current }),
    });
    setNewsList((prev) =>
      prev.map((n) => (n.id === newsId ? { ...n, isPublished: !current } : n))
    );
    setActionLoading(false);
  }

  // Filter und Sortierung
  const filteredNews = newsList.filter(news => 
    news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedNews = [...filteredNews].sort((a, b) => {
    let valA = a[sortBy as keyof News];
    let valB = b[sortBy as keyof News];
    if (sortBy === "publishDate") {
      valA = new Date(valA as string).getTime();
      valB = new Date(valB as string).getTime();
    }
    if (sortBy === "isPublished") {
      valA = a.isPublished ? 1 : 0;
      valB = b.isPublished ? 1 : 0;
    }
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function handleSort(col: string) {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Technologie": "bg-blue-100 text-blue-800 border-blue-200",
      "Business": "bg-green-100 text-green-800 border-green-200",
      "Events": "bg-purple-100 text-purple-800 border-purple-200",
      "Marketing": "bg-orange-100 text-orange-800 border-orange-200",
      "default": "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[category] || colors.default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">News Management</h1>
                <p className="text-sm text-gray-500">{newsList.length} Artikel insgesamt</p>
              </div>
            </div>
            <Link
              href="/admin/news/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Neue News anlegen
            </Link>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Nach Titel oder Kategorie suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Gefiltert:</span>
              <span className="font-semibold text-gray-900">{sortedNews.length} Artikel</span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
              <p className="text-gray-500">Lade News-Artikel...</p>
            </div>
          </div>
        ) : sortedNews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Artikel gefunden</h3>
              <p className="text-gray-500">Erstellen Sie Ihren ersten News-Artikel oder passen Sie Ihre Suche an.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200/50 transition-colors"
                    onClick={() => handleSort("publishDate")}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Datum
                      {sortBy === "publishDate" && (
                        <span className="text-red-500">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200/50 transition-colors"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-2">
                      Titel
                      {sortBy === "title" && (
                        <span className="text-red-500">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200/50 transition-colors"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center gap-2">
                      Kategorie
                      {sortBy === "category" && (
                        <span className="text-red-500">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Aufrufe
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200/50 transition-colors"
                    onClick={() => handleSort("isPublished")}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {sortBy === "isPublished" && (
                        <span className="text-red-500">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedNews.map((news, idx) => (
                  <tr key={news.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(news.publishDate).toLocaleDateString("de-DE", { 
                          day: "2-digit", 
                          month: "2-digit", 
                          year: "numeric" 
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(news.publishDate).toLocaleTimeString("de-DE", { 
                          hour: "2-digit", 
                          minute: "2-digit" 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {news.imageUrl && (
                          <img 
                            src={news.imageUrl} 
                            alt={news.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">{news.title}</div>
                          {news.subtitle && (
                            <div className="text-xs text-gray-500 line-clamp-1">{news.subtitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(news.category)}`}>
                        {news.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {news.viewCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={news.isPublished}
                          onChange={() => togglePublish(news.id, news.isPublished)}
                          className={`${
                            news.isPublished ? "bg-green-500" : "bg-gray-300"
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
                          disabled={actionLoading}
                        >
                          <span className="sr-only">Publish</span>
                          <span
                            className={`${
                              news.isPublished ? "translate-x-6" : "translate-x-1"
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </Switch>
                        <span className={`text-xs font-medium ${news.isPublished ? 'text-green-600' : 'text-gray-500'}`}>
                          {news.isPublished ? 'Online' : 'Entwurf'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/news/${news.id}/edit`}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                            actionLoading ? "pointer-events-none opacity-50" : ""
                          }`}
                          onClick={() => setActionLoading(true)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Bearbeiten
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {actionLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <span className="text-gray-700 font-medium">Verarbeite...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}