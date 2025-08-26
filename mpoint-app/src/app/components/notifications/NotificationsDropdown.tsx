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

  const getTypeStyle = (type: string) => {
    switch(type) {
      case "MATCH_REQUEST":
        return "bg-gradient-to-r from-pink-500 to-rose-500 text-white";
      case "MATCH_ACCEPTED":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
      case "MESSAGE":
        return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";
      case "SYSTEM":
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "MATCH_REQUEST":
      case "MATCH_ACCEPTED":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
        );
      case "MESSAGE":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Gerade eben';
    if (minutes < 60) return `vor ${minutes}m`;
    if (hours < 24) return `vor ${hours}h`;
    if (days < 7) return `vor ${days}d`;
    
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Notifications"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
      >
        {/* Animated Bell Icon */}
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          className="text-gray-700 group-hover:text-gray-900 transition-colors group-hover:animate-pulse"
        >
          <path 
            fill="currentColor" 
            d="M12 2a6 6 0 0 0-6 6v3.586l-1.707 1.707A1 1 0 0 0 5 15h14a1 1 0 0 0 .707-1.707L18 11.586V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z" 
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center shadow-lg animate-bounce">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-lg">Benachrichtigungen</div>
                  {unread > 0 && (
                    <div className="text-xs text-white/90">{unread} neue Nachrichten</div>
                  )}
                </div>
              </div>
              {unread > 0 && (
                <button 
                  onClick={markAllRead} 
                  className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors backdrop-blur"
                >
                  Alle gelesen
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <ul className="max-h-[400px] overflow-y-auto">
            {items.length === 0 ? (
              <li className="p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Keine neuen Benachrichtigungen</p>
                <p className="text-gray-400 text-sm mt-1">Wir informieren Sie über neue Aktivitäten</p>
              </li>
            ) : (
              items.map((n, idx) => (
                <li key={n.id} className="relative">
                  <Link 
                    href={n.url || "/notifications"} 
                    className={`block px-5 py-4 hover:bg-gray-50 transition-colors ${
                      !n.isRead ? "bg-gradient-to-r from-red-50 to-transparent" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon/Badge */}
                      <div className={`p-2 rounded-lg ${getTypeStyle(n.type)} flex-shrink-0 shadow-sm`}>
                        {getTypeIcon(n.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 line-clamp-1">
                              {n.title}
                            </div>
                            {n.body && (
                              <div className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                                {n.body}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!n.isRead && (
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                            <span className="text-xs text-gray-400">
                              {formatTime(new Date(n.createdAt))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  {idx < items.length - 1 && <div className="border-b border-gray-100 mx-5"></div>}
                </li>
              ))
            )}
          </ul>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-5 py-3">
            <Link 
              href="/notifications" 
              className="flex items-center justify-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              <span>Alle Benachrichtigungen ansehen</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}