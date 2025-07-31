"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        const res = await fetch(`/api/news/${id}`);
        if (res.ok) {
          const data = await res.json();
          setNews(data);
        }
      } catch {}
      setLoading(false);
    }
    if (id) fetchNews();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e60000]"></div>
      </div>
    );
  }
  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">News nicht gefunden.</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          className="mb-6 flex items-center gap-2 text-[#e60000] font-medium hover:underline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>
        <article className="bg-white rounded-xl shadow-sm p-8">
          {news.imageUrl && (
            <img src={news.imageUrl} alt={news.title} className="w-full h-64 object-cover rounded-lg mb-6" />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{news.title}</h1>
          {news.subtitle && <h2 className="text-lg text-gray-600 mb-4">{news.subtitle}</h2>}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <span>{new Date(news.publishDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            {news.author && <><span>•</span><span>Von {news.author}</span></>}
            {news.readTime && <><span>•</span><span>{news.readTime} Lesezeit</span></>}
            {news.category && <><span>•</span><span>{news.category.charAt(0).toUpperCase() + news.category.slice(1).toLowerCase()}</span></>}
          </div>
          <div className="prose max-w-none text-gray-900" dangerouslySetInnerHTML={{ __html: news.longText || "" }} />
        </article>
      </div>
    </main>
  );
}
