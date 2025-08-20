"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Item = {
  id: string;
  title: string;
  body?: string | null;
  url?: string | null;
  isRead: boolean;
  createdAt: string;
  type: "MESSAGE" | "MATCH_REQUEST" | "MATCH_ACCEPTED" | "SYSTEM";
};

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    const [listRes, unreadRes] = await Promise.all([
      fetch(`/api/notifications?limit=5`, { cache: "no-store" }),
      fetch(`/api/notifications/unread-count`, { cache: "no-store" }),
    ]);
    const listJson = await listRes.json();
    const unreadJson = await unreadRes.json();
    setItems(listJson.items || []);
    setUnread(unreadJson.unread || 0);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const markAllRead = async () => {
    await fetch(`/api/notifications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    await load();
  };

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Notifications"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition"
      >
        {/* Bell Icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" className="text-gray-700">
          <path fill="currentColor" d="M12 2a6 6 0 0 0-6 6v3.586l-1.707 1.707A1 1 0 0 0 5 15h14a1 1 0 0 0 .707-1.707L18 11.586V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="font-semibold">Benachrichtigungen</div>
            <button onClick={markAllRead} className="text-sm text-blue-600 hover:underline">
              Alle als gelesen
            </button>
          </div>
          <ul className="max-h-96 overflow-auto divide-y">
            {items.length === 0 && (
              <li className="p-4 text-sm text-gray-500">Keine Benachrichtigungen</li>
            )}
            {items.map((n) => (
              <li key={n.id} className={`p-4 ${!n.isRead ? "bg-red-50/40" : ""}`}>
                <Link href={n.url || "/notifications"} className="block">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-sm px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {n.type}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{n.title}</div>
                      {n.body && <div className="text-sm text-gray-600 line-clamp-2">{n.body}</div>}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-4 py-3 border-t text-right">
            <Link href="/notifications" className="text-sm text-blue-600 hover:underline">
              Alle ansehen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}