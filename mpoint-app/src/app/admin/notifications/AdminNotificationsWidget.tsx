"use client";
import { useEffect, useState } from "react";

export default function AdminNotificationsWidget({ limit = 6 }: { limit?: number }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/notifications?limit=${limit}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Neueste Benachrichtigungen</h2>
        <a href="/admin/notifications" className="text-xs text-red-600 hover:underline">Alle</a>
      </div>
      {loading ? (
        <div className="text-sm text-gray-500">Lade...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">Keine Einträge</div>
      ) : (
        <ul className="space-y-3 text-sm">
          {items.map(n => (
            <li key={n.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 flex-1 line-clamp-1">{n.title}</span>
                {!n.isRead && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white">Neu</span>}
              </div>
              {n.body && <p className="text-gray-600 text-xs mt-1 line-clamp-2">{n.body}</p>}
              <div className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleTimeString()}</div>
              {n.url && (
                <a href={n.url} className="text-xs text-red-600 hover:underline mt-1 inline-block">
                  Öffnen
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}