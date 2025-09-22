"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/Button";
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
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e60000] mx-auto mb-4"></div>
          <p className="text-gray-600">Lädt News...</p>
        </div>
      </main>
    );
  }
  if (!news) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">News nicht gefunden.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Button
          onClick={() => router.back()}
          icon={ArrowLeft}
          variant="primary"
        >
          Zurück zu News
        </Button>
        <article className="bg-white rounded-xl shadow-sm">
          {news.imageUrl && (
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-64 object-cover rounded-t-xl"
            />
          )}
          <div className="p-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">
              {news.title}
            </h1>
            {news.subtitle && (
              <h2 className="text-lg text-gray-600 mb-4">{news.subtitle}</h2>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex flex-row flex-wrap gap-x-4 text-sm text-gray-500 mb-6">
                <span>
                  {new Date(news.publishDate).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                {news.author && <span>Von {news.author}</span>}
                {news.readTime && <span>{news.readTime} Lesezeit</span>}
                {news.category && (
                  <span>
                    {news.category.charAt(0).toUpperCase() +
                      news.category.slice(1).toLowerCase()}
                  </span>
                )}
              </div>
            </div>
            <div
              className="prose max-w-none text-gray-900 [&>*]:mb-4 [&_h2]:text-2xl [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:mb-3 [&_blockquote]:italic [&_blockquote]:text-gray-600"
              dangerouslySetInnerHTML={{ __html: news.longText || "" }}
            />
          </div>
        </article>
      </div>
    </main>
  );
}
