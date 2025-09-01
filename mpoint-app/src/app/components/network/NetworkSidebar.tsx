"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageCircle, Search, Network, Users, UserPlus, Hash, Calendar, Building2 } from "lucide-react";

type ChatItem = {
  peerUserId: string;
  name?: string;
  companyName?: string;
  channelType: "match" | "direct";
  lastAt?: string | Date;
  lastContent?: string;
  matchId?: string | null;
};

// NetworkStat Component
function NetworkStat({
  label,
  icon,
  count,
  href,
}: {
  label: string;
  icon: React.ReactNode;
  count: number;
  href?: string;
}) {
  const router = useRouter();
  
  return (
    <div 
      onClick={() => href && router.push(href)}
      className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer hover:shadow-md transition-all group"
    >
      <span className="flex items-center gap-3 text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
        {icon}
        <span>{label}</span>
      </span>
      <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
        {count}
      </span>
    </div>
  );
}

export default function ChatSidebar({
  
  activePeerUserId,
  networkStats = {
    kontakte: 256,
    follow: 142,
    gruppen: 12,
    events: 8,
    unternehmen: 15,
  }
}: {
  activePeerUserId?: string;
  networkStats?: {
    kontakte?: number;
    follow?: number;
    gruppen?: number;
    events?: number;
    unternehmen?: number;
  };
}) {
  const { data: session } = useSession();
  const me = session?.user?.id;
  const router = useRouter();
  const [items, setItems] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  
  // Refs für optimiertes Loading
  const cacheRef = useRef<{ data: ChatItem[], timestamp: number } | null>(null);
  const loadingRef = useRef(false);
  const queuedUpdateRef = useRef(false);
  const lastUpdateRef = useRef(0);

  // Optimierte Load-Funktion mit intelligentem Update-Handling
  const loadConversations = useCallback(async (options: {
    useCache?: boolean;
    isUpdate?: boolean;
    force?: boolean;
  } = {}) => {
    const { useCache = true, isUpdate = false, force = false } = options;
    
    if (!me) return;

    // Rate limiting für Updates (außer bei force)
    if (!force && isUpdate) {
      const now = Date.now();
      if (now - lastUpdateRef.current < 500) {
        queuedUpdateRef.current = true;
        return;
      }
      lastUpdateRef.current = now;
    }

    // Cache prüfen
    if (useCache && cacheRef.current && !force) {
      const isValid = Date.now() - cacheRef.current.timestamp < 5 * 60 * 1000;
      if (isValid) {
        setItems(cacheRef.current.data);
        setLoading(false);
        return;
      }
    }

    // Verhindere parallele Requests
    if (loadingRef.current) {
      if (isUpdate) {
        queuedUpdateRef.current = true;
      }
      return;
    }

    loadingRef.current = true;
    
    // Nur beim initialen Load auf true setzen, nicht bei Updates
    if (!isUpdate && items.length === 0) {
      setLoading(true);
    }

    try {
      const res = await fetch(`/api/chat/conversations`, {
        headers: { 
          "Cache-Control": "no-cache",
          "X-Request-Type": isUpdate ? "update" : "initial"
        },
        // Kürzeres Timeout für Updates
        signal: AbortSignal.timeout(isUpdate ? 5000 : 10000)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      if (Array.isArray(json)) {
        // Intelligent mergen bei Updates
        if (isUpdate && items.length > 0) {
          const mergedItems = mergeConversations(items, json);
          setItems(mergedItems);
          cacheRef.current = {
            data: mergedItems,
            timestamp: Date.now(),
          };
        } else {
          setItems(json);
          cacheRef.current = {
            data: json,
            timestamp: Date.now(),
          };
        }
      }
    } catch (error: any) {
      // Bei Timeout oder Fehler während Update: Alte Daten behalten
      if (isUpdate && items.length > 0) {
        console.warn("Update fehlgeschlagen, behalte alte Daten:", error.message);
      } else {
        console.error("Laden fehlgeschlagen:", error);
        setItems([]);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
      
      // Queued Update ausführen
      if (queuedUpdateRef.current) {
        queuedUpdateRef.current = false;
        setTimeout(() => {
          loadConversations({ useCache: false, isUpdate: true });
        }, 100);
      }
    }
  }, [me, items]);

  // Helper: Conversations intelligent mergen
  const mergeConversations = (oldItems: ChatItem[], newItems: ChatItem[]) => {
    const itemMap = new Map<string, ChatItem>();
    
    // Alte Items als Basis
    oldItems.forEach(item => itemMap.set(item.peerUserId, item));
    
    // Neue Items drüber mergen
    newItems.forEach(item => {
      const existing = itemMap.get(item.peerUserId);
      if (!existing || 
          !item.lastAt || 
          !existing.lastAt ||
          new Date(item.lastAt) > new Date(existing.lastAt)) {
        itemMap.set(item.peerUserId, item);
      }
    });
    
    return Array.from(itemMap.values());
  };

  // Initial Load
  useEffect(() => {
    if (!me) return;
    loadConversations({ useCache: true, isUpdate: false });
  }, [me]);

  // Event Listeners mit intelligentem Debouncing
  useEffect(() => {
    if (!me) return;

    let updateTimeout: NodeJS.Timeout;
    let messageTimeout: NodeJS.Timeout;

    // Für normale Updates (matches, requests)
    const handleUpdate = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        loadConversations({ useCache: false, isUpdate: true });
      }, 800);
    };

    // Für Nachrichten-Updates (schnellere Reaktion)
    const handleMessageUpdate = () => {
      clearTimeout(messageTimeout);
      messageTimeout = setTimeout(() => {
        loadConversations({ useCache: false, isUpdate: true, force: true });
      }, 200);
    };

    // Event Listener registrieren
    window.addEventListener("matches-updated", handleUpdate);
    window.addEventListener("matching-requests-updated", handleUpdate);
    window.addEventListener("chat-message-sent", handleMessageUpdate);
    window.addEventListener("chat-message-received", handleMessageUpdate);
    
    return () => {
      clearTimeout(updateTimeout);
      clearTimeout(messageTimeout);
      window.removeEventListener("matches-updated", handleUpdate);
      window.removeEventListener("matching-requests-updated", handleUpdate);
      window.removeEventListener("chat-message-sent", handleMessageUpdate);
      window.removeEventListener("chat-message-received", handleMessageUpdate);
    };
  }, [me, loadConversations]);

  // Suche mit Debouncing
  const [debouncedQ, setDebouncedQ] = useState(q);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 150);
    return () => clearTimeout(timer);
  }, [q]);

  // Optimierte Filterung
  const filtered = useMemo(() => {
    const searchTerm = debouncedQ.trim().toLowerCase();
    if (!searchTerm) return items;
    
    return items.filter((m) => {
      const searchText = `${m.name || ''} ${m.companyName || ''}`.toLowerCase();
      return searchText.includes(searchTerm);
    });
  }, [items, debouncedQ]);

  // Initialen-Cache
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

  // Navigation Handler
  const handleChatClick = useCallback((peerUserId: string) => {
    router.push(`/chat/${peerUserId}`);
  }, [router]);

  // Render Loading State (nur beim initialen Laden)
  const showLoading = loading && items.length === 0;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-4">
      {/* Chat Section */}
      <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-white/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          <MessageCircle className="w-6 h-6 text-[#e60000]" />
        </div>
        
        {/* Suche */}
        <div className="relative mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Namen suchen…"
            className="w-full border border-gray-200 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60000]/20 focus:border-[#e60000] transition-all"
            disabled={showLoading}
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {loadingRef.current && items.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#e60000] rounded-full animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {showLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-[#e60000] rounded-full animate-spin"></div>
                <span>Lade Chats...</span>
              </div>
            </div>
          )}
          
          {!showLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-1">
                {debouncedQ ? "Keine Chats gefunden" : "Noch keine Conversations"}
              </p>
              <p className="text-xs text-gray-400">
                {debouncedQ ? "Versuche einen anderen Suchbegriff" : "Starte ein Match um zu chatten"}
              </p>
            </div>
          )}

          {!showLoading && filtered.length > 0 && (
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filtered.map((m) => {
                const active = m.peerUserId === activePeerUserId;
                const displayName = m.name || m.companyName || "Unbekannt";
                const initials = getInitials(displayName);
                
                return (
                  <div
                    key={m.peerUserId}
                    onClick={() => handleChatClick(m.peerUserId)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-all group ${
                      active
                        ? "border-[#e60000] bg-[#e60000]/5 shadow-md"
                        : "border-gray-200 hover:bg-gray-50 hover:shadow-md"
                    }`}
                  >
                    <span className={`flex items-center gap-3 font-medium transition-colors ${
                      active 
                        ? "text-[#e60000]" 
                        : "text-gray-700 group-hover:text-gray-900"
                    }`}>
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          active
                            ? "bg-gradient-to-br from-[#e60000] to-[#c00000] text-white shadow-lg"
                            : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 group-hover:from-gray-300 group-hover:to-gray-400"
                        }`}
                      >
                        {initials}
                      </div>
                      
                      {/* Name und Details */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate">
                          {displayName}
                        </div>
                        {m.lastContent && (
                          <div className="text-xs text-gray-400 truncate mt-0.5">
                            {m.lastContent}
                          </div>
                        )}
                      </div>
                    </span>
                    
                    {/* Meta Info Badge */}
                    <div className="flex flex-col items-end gap-1">
                      <span className={`font-bold px-3 py-1 rounded-lg text-xs ${
                        active 
                          ? "bg-[#e60000] text-white" 
                          : "bg-gray-100 text-gray-900"
                      }`}>
                        {m.channelType === "match" ? "Match" : "Direkt"}
                      </span>
                      {m.lastAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(m.lastAt).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Network Section */}
      <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-white/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Ihr Netzwerk
          </h2>
          <Network className="w-6 h-6 text-[#e60000]" />
        </div>
        <div className="space-y-3">
          <NetworkStat
            label="M-POINT Kontakte"
            icon={<Users className="w-5 h-5 text-[#e60000]" />}
            count={networkStats.kontakte || 0}
            href="/Matches"
          />
          <NetworkStat
            label="Gruppen"
            icon={<Hash className="w-5 h-5 text-blue-500" />}
            count={networkStats.gruppen || 0}
            href="/groups"
          />
          <NetworkStat
            label="Events"
            icon={<Calendar className="w-5 h-5 text-green-500" />}
            count={networkStats.events || 0}
            href="/events"
          />
        </div>
      </div>
    </aside>
  );
}