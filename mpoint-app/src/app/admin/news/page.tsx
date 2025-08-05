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

  // Sortierfunktion
  const sortedNews = [...newsList].sort((a, b) => {
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

  return (
    <div className="p-8 max-w-5xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">News verwalten</h1>
        <Link
          href="/admin/news/new"
          className="bg-[#e60000] text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Neue News anlegen
        </Link>
      </div>
      {loading ? (
        <div>Lade News...</div>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="p-2 text-left cursor-pointer" onClick={() => handleSort("publishDate")}>Veröffentlicht am {sortBy === "publishDate" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
              <th className="p-2 text-left cursor-pointer" onClick={() => handleSort("title")}>Titel {sortBy === "title" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
              <th className="p-2 text-left cursor-pointer" onClick={() => handleSort("category")}>Kategorie {sortBy === "category" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
              <th className="p-2 text-left cursor-pointer" onClick={() => handleSort("isPublished")}>Veröffentlicht {sortBy === "isPublished" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
              <th className="p-2 text-left">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {sortedNews.map((news) => (
              <tr key={news.id} className="border-t">
                <td className="p-2">{new Date(news.publishDate).toLocaleString("de-DE")}</td>
                <td className="p-2">{news.title}</td>
                <td className="p-2">{news.category}</td>
                <td className="p-2">
                  <Switch
                    checked={news.isPublished}
                    onChange={() => togglePublish(news.id, news.isPublished)}
                    className={`${news.isPublished ? "bg-green-500" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full`}
                    disabled={actionLoading}
                  >
                    <span className="sr-only">Publish</span>
                    <span
                      className={`${news.isPublished ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white`}
                    />
                  </Switch>
                </td>
                <td className="p-2 flex gap-2">
                  <Link
                    href={`/admin/news/${news.id}/edit`}
                    className={`text-blue-600 hover:underline ${actionLoading ? "pointer-events-none opacity-50" : ""}`}
                    onClick={() => setActionLoading(true)}
                  >
                    Bearbeiten
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {actionLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#e60000]"></div>
        </div>
      )}
    </div>
  );
}
