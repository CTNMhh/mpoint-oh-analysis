"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type ChatItem = {
  peerUserId: string;
  name?: string;
  companyName?: string;
  channelType: "match" | "direct";
  lastAt?: string | Date;
  lastContent?: string;
  matchId?: string | null;
};

export default function ChatSidebar({
  companyId,
  activePeerUserId,
}: {
  companyId: string | null;
  activePeerUserId?: string;
}) {
  const { data: session } = useSession();
  const me = session?.user?.id;
  const router = useRouter();
  const [items, setItems] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<{ data: ChatItem[], timestamp: number } | null>(null);
  const inFlightRef = useRef(false);
  const pendingReloadRef = useRef(false);

  // Optimierte Load-Funktion mit Cache und AbortController
  const loadConversations = useCallback(async (useCache = true) => {
    if (!me) return;

    // Cache prüfen (5 Minuten gültig)
    if (useCache && cacheRef.current) {
      const isValid = Date.now() - cacheRef.current.timestamp < 5 * 60 * 1000;
      if (isValid) {
        setItems(cacheRef.current.data);
        setLoading(false);
        return;
      }
    }

    // Falls gerade ein Fetch läuft: Reload vormerken statt abzubrechen (verhindert "canceled")
    if (inFlightRef.current) {
      pendingReloadRef.current = true;
      return;
    }

    setLoading(true);
    inFlightRef.current = true;

    try {
      const res = await fetch(`/api/chat/conversations`, {
        headers: { "Cache-Control": "no-cache" },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      if (Array.isArray(json)) {
        setItems(json);
        // Cache aktualisieren
        cacheRef.current = {
          data: json,
          timestamp: Date.now(),
        };
      } else {
        setItems([]);
      }
    } catch (error: any) {
      console.warn("Chats laden fehlgeschlagen:", error);
      setItems([]);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
      // Falls während des Ladens ein weiterer Reload angefordert wurde → direkt nachladen
      if (pendingReloadRef.current) {
        pendingReloadRef.current = false;
        // Kein Cache beim erneuten Laden
        loadConversations(false);
      }
    }
  }, [me]);

  // Initial Load mit Cache
  useEffect(() => {
    if (!me) return;
    loadConversations(true);

    return () => {
      // Keine Aborts nötig – wir lassen den letzten Request auslaufen
    };
  }, [me, loadConversations]);

  // Event-Listener mit Debounce für Updates
  useEffect(() => {
    if (!me) return;

    let timeoutId: NodeJS.Timeout;

    const onUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        loadConversations(false);
      }, 400);
    };

    window.addEventListener("matches-updated", onUpdate);
    window.addEventListener("matching-requests-updated", onUpdate);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("matches-updated", onUpdate);
      window.removeEventListener("matching-requests-updated", onUpdate);
    };
  }, [me, loadConversations]);

  // Optimierte Filterung mit useMemo
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    
    return items.filter((m) => {
      const searchText = `${m.name || ''} ${m.companyName || ''}`.toLowerCase();
      return searchText.includes(s);
    });
  }, [items, q]);

  // Optimierte Initialen-Generierung mit Memoization
  const getInitials = useMemo(() => {
    const cache = new Map<string, string>();
    
    return (name?: string) => {
      if (!name) return "?";
      
      if (cache.has(name)) {
        return cache.get(name)!;
      }
      
      const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
        
      cache.set(name, initials);
      return initials;
    };
  }, []);

  // Optimierte Navigation mit startTransition
  const handleChatClick = useCallback((peerUserId: string) => {
    router.push(`/chat/${peerUserId}`);
  }, [router]);

  return (
    <aside className="h-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header mit M-POINT Branding */}
      <div className="bg-gradient-to-r from-red-50 to-red-100/50 px-4 py-3 border-b border-red-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">🅼</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">Chats</h3>
          {!loading && (
            <span className="text-xs text-gray-500 ml-auto">
              {filtered.length}
            </span>
          )}
        </div>
        
        {/* Optimierte Suche */}
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Namen suchen…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
              <span>Lade Chats...</span>
            </div>
          </div>
        )}
        
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-1">
              {q ? "Keine Chats gefunden" : "Noch keine Conversations"}
            </p>
            <p className="text-xs text-gray-400">
              {q ? "Versuche einen anderen Suchbegriff" : "Starte ein Match um zu chatten"}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="overflow-y-auto h-full">
            <ul className="p-2 space-y-1">
              {filtered.map((m) => {
                const active = m.peerUserId === activePeerUserId;
                const displayName = m.name || m.companyName || "Unbekannt";
                const initials = getInitials(displayName);
                
                return (
                  <li key={m.peerUserId}>
                    <button
                      onClick={() => handleChatClick(m.peerUserId)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group ${
                        active
                          ? "bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 shadow-sm"
                          : "hover:bg-gray-50 hover:scale-[1.02] hover:shadow-sm"
                      }`}
                    >
                      {/* Avatar mit verbesserter Performance */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          active
                            ? "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg"
                            : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 group-hover:from-gray-300 group-hover:to-gray-400"
                        }`}
                      >
                        {initials}
                      </div>
                      
                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div
                          className={`truncate text-sm font-medium ${
                            active
                              ? "text-red-900"
                              : "text-gray-800 group-hover:text-gray-900"
                          }`}
                        >
                          {displayName}
                        </div>
                        
                        {/* Meta Info */}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                            m.channelType === "match" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {m.channelType === "match" ? "Match" : "Direkt"}
                          </span>
                          {m.lastAt && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span>
                                {new Date(m.lastAt).toLocaleDateString("de-DE", {
                                  day: "2-digit",
                                  month: "2-digit",
                                })}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* Last Message */}
                        {m.lastContent && (
                          <div className="text-xs text-gray-400 truncate mt-0.5">
                            {m.lastContent}
                          </div>
                        )}
                      </div>
                      
                      {/* Active Indicator */}
                      {active && (
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}