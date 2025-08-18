import { notFound } from "next/navigation";

export default async function MarketplaceDetailPage({ params }: { params: { id: string } }) {
  // Build absolute URL for server-side fetch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/marketplace/${params.id}`); // API bleibt gleich, nur die URL im Frontend ist /boerse
  if (!res.ok) return notFound();
  const entry = await res.json();

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-primary text-2xl font-bold mb-4">Börse</h1>
        <h2 className="text-3xl font-bold text-primary mb-2">{entry.title}</h2>
        <div className="mb-4 text-sm text-gray-500">
          Kategorie: <span className="font-semibold">{entry.category}</span> | Typ: <span className="font-semibold">{entry.type}</span>
        </div>
        <div className="mb-6 text-gray-700">
          <span className="font-semibold">Kurzbeschreibung:</span> {entry.shortDescription}
        </div>
        <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: entry.longDescription || "<em>Keine Detailbeschreibung vorhanden.</em>" }} />
        <div className="text-sm text-gray-500 mb-2">Erstellt von: {entry.user?.firstName} {entry.user?.lastName}</div>
        <div className="text-sm text-gray-500">Kontakt: {entry.email}</div>
      </div>
    </main>
  );
}
