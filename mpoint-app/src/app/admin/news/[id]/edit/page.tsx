"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AdminNewsEditPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    shortText: "",
    longText: "",
    imageUrl: "",
    author: "",
    category: "ALLGEMEIN",
    tags: "",
    readTime: "",
    isPublished: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      const res = await fetch(`/api/admin/news/${id}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          ...data,
          tags: data.tags ? data.tags.join(", ") : "",
        });
      }
      setLoading(false);
    }
    if (id) fetchNews();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/news/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      router.push("/admin/news");
    } else {
      setError("Fehler beim Speichern der News.");
    }
    setLoading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  if (loading) return <div className="p-8">Lade News...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">News bearbeiten</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Titel" required className="w-full border p-2 rounded" />
        <input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Untertitel" className="w-full border p-2 rounded" />
        <input name="shortText" value={form.shortText} onChange={handleChange} placeholder="Kurztext" required className="w-full border p-2 rounded" />
        <textarea name="longText" value={form.longText} onChange={handleChange} placeholder="Langtext (HTML erlaubt)" required className="w-full border p-2 rounded min-h-[120px]" />
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="Bild-URL" className="w-full border p-2 rounded" />
        <input name="author" value={form.author} onChange={handleChange} placeholder="Autor" className="w-full border p-2 rounded" />
        <select name="category" value={form.category} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="ALLGEMEIN">Allgemein</option>
          <option value="WIRTSCHAFT">Wirtschaft</option>
          <option value="TECHNOLOGIE">Technologie</option>
          <option value="DIGITALISIERUNG">Digitalisierung</option>
          <option value="NACHHALTIGKEIT">Nachhaltigkeit</option>
          <option value="EVENTS">Events</option>
          <option value="NETZWERK">Netzwerk</option>
          <option value="FOERDERUNG">Förderung</option>
          <option value="POLITIK">Politik</option>
        </select>
        <input name="tags" value={form.tags} onChange={handleChange} placeholder="Tags (Komma-getrennt)" className="w-full border p-2 rounded" />
        <input name="readTime" value={form.readTime} onChange={handleChange} placeholder="Lesezeit (z.B. 5 Min.)" className="w-full border p-2 rounded" />
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" disabled={loading} className="bg-[#e60000] text-white px-4 py-2 rounded hover:bg-red-700">
          {loading ? "Speichern..." : "Änderungen speichern"}
        </button>
      </form>
    </div>
  );
}
