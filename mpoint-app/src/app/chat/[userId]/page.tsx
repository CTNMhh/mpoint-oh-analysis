"use client";

import React from "react";
import { useEffect, useRef, useState, useMemo, useCallback, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import ChatSidebar from "../ChatSidebar";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

// URLs und Emails im Text als Links rendern
function linkify(text: string) {
  const TOKEN =
    /(https?:\/\/[^\s]+|www\.[^\s]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

  return text.split(TOKEN).map((part, i) => {
    if (!part) return null;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part);
    const isUrl = /^(https?:\/\/[^\s]+|www\.[^\s]+)/i.test(part);

    if (!isEmail && !isUrl) return <span key={i}>{part}</span>;

    const href = isEmail
      ? `mailto:${part}`
      : part.startsWith("http")
      ? part
      : `https://${part}`;

    const match = /^(.*?)([),.;!?]+)?$/.exec(part);
    const visible = match?.[1] ?? part;
    const trailing = match?.[2] ?? "";

    return (
      <span key={i}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80 break-all"
        >
          {visible}
        </a>
        {trailing}
      </span>
    );
  });
}

// Kleine MessageBubble Komponente zur Memoisierung
const MessageBubble = React.memo(function MessageBubble({
  msg,
  mine
}: {
  msg: any;
  mine: boolean;
}) {
  const linkified = useMemo(() => linkify(msg.content || ""), [msg.content]);
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"} animate-fadeIn`}>
      <div className={`group relative max-w-[70%] ${mine ? "order-1" : ""}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            mine
              ? "bg-gradient-to-br from-[#e60000] to-[#cc0000] text-white rounded-br-sm"
              : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
          } ${msg.optimistic ? "opacity-70" : ""}`}
        >
          <p className="text-sm leading-relaxed break-words">
            {linkified}
          </p>
          <div
            className={`mt-1.5 text-[10px] ${
              mine ? "text-white/80" : "text-gray-400"
            }`}
          >
            {new Date(msg.createdAt).toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

export default function ChatPage() {
  const { userId: peerUserId } = useParams<{ userId: string }>();
  const { data: session } = useSession();
  const myUserId = session?.user?.id;

  // Zustand wie im alten Layout
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);              // lädt companyId
  const [messagesLoading, setMessagesLoading] = useState(false); // lädt History
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // NEU: Gesamtladestand
  const [isSending, startSending] = useTransition();
  const [peerName, setPeerName] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const emojiWrapRef = useRef<HTMLDivElement>(null);

  // companyId laden (nur Layout / gleiche Optik; Funktionalität bleibt peerUserId-basiert)
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    setLoading(true);
    fetch(`/api/company?userId=${userId}`)
      .then(r => r.json())
      .then(d => {
        const id = Array.isArray(d) ? d[0]?.id : d?.id;
        setCompanyId(id ?? null);
      })
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  // History + SSE (unverändert zur neuen peerUserId-Logik)
  useEffect(() => {
    if (!peerUserId || !myUserId || peerUserId === myUserId) return;
    setMessagesLoading(true);
    let es: EventSource | null = null;
    fetch(`/api/chat/history?peerUserId=${peerUserId}`)
      .then(r => r.json())
      .then(d => {
        setMessages(d.messages || []);
        es = new EventSource(`/api/chat/stream?peerUserId=${peerUserId}&_=${Date.now()}`);
        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === "message") {
              const msg = data.message;
              setMessages(prev => {
                // Schon vorhanden? -> nichts tun
                if (prev.some(p => p.id === msg.id)) return prev;

                // Falls von mir: ersetze erste passende optimistische (gleicher Inhalt) statt doppelt
                if (msg.senderUserId === myUserId) {
                  const idx = prev.findIndex(p => p.optimistic && p.content === msg.content);
                  if (idx !== -1) {
                    const clone = [...prev];
                    clone[idx] = msg;
                    return clone;
                  }
                }
                return [...prev, msg];
              });
            }
          } catch {}
        };
      })
      .finally(() => setMessagesLoading(false));
    return () => { es?.close(); };
  }, [peerUserId, myUserId]);

  // NEU: Warten bis alle kritischen Ladevorgänge abgeschlossen sind
  useEffect(() => {
    // Seite möglichst schnell freigeben – nicht blockieren bis Messages da sind
    if (session?.user && peerUserId) {
      setInitialLoadComplete(true);
    }
  }, [loading, messagesLoading, session?.user, peerUserId]);

  // Peer-Anzeigename laden
  useEffect(() => {
    if (!peerUserId || peerUserId === myUserId) {
      setPeerName("");
      return;
    }
    let ignore = false;
    fetch(`/api/chat/user-summary?userId=${peerUserId}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (ignore || !d) return;
        // Bevorzuge Firmenname, sonst DisplayName, sonst ID
        const preferred =
          d.companyName?.trim() ||
          d.displayName?.trim() ||
          d.id ||
          "";
        setPeerName(preferred);
      })
      .catch(() => {
        if (!ignore) setPeerName("");
      });
    return () => { ignore = true; };
  }, [peerUserId, myUserId]);

  // Scroll nachladen
  useEffect(() => {
    if (messagesLoading) return;
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length, messagesLoading]);

  // Emoji-Popover schließen
  useEffect(() => {
    if (!showEmoji) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!emojiWrapRef.current || emojiWrapRef.current.contains(target)) return;
      if (emojiBtnRef.current?.contains(target)) return;
      setShowEmoji(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setShowEmoji(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [showEmoji]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim() || !peerUserId || !myUserId) return;
    const value = text.trim();
    setText("");
    const wasEmptyBefore = messages.length === 0;

    // Optimistische Nachricht
    const optimisticId = "tmp-" + Date.now();
    setMessages(prev => [
      ...prev,
      {
        id: optimisticId,
        content: value,
        senderUserId: myUserId,
        createdAt: new Date().toISOString(),
        optimistic: true
      }
    ]);

    startSending(async () => {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerUserId, content: value })
      });
      if (!res.ok) {
        // Optimistische entfernen (Fehler)
        setMessages(prev => prev.filter(m => m.id !== optimisticId));
      } else {
        if (wasEmptyBefore) {
          // Neue Unterhaltung -> Sidebar aktualisieren
          window.dispatchEvent(new Event("chat-conversations-changed"));
        }
      }
      // Erfolgsfall: echte Nachricht ersetzt über SSE (Logik oben)
    });
  }

  // Session/Auth-Checks
  if (!session?.user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Anmeldung erforderlich</h3>
          <p className="text-sm text-gray-500">Bitte melden Sie sich an, um den Chat zu verwenden.</p>
        </div>
      </main>
    );
  }

  if (peerUserId === myUserId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0l-6.918 7.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ungültiger Chat</h3>
          <p className="text-sm text-gray-500">Sie können nicht mit sich selbst chatten.</p>
        </div>
      </main>
    );
  }

  // Erst hier wird die eigentliche Chat-Seite gerendert
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-25 pb-4">
      <div className="max-w-5xl mx-auto h[calc(100vh-6rem)] md:h-[calc(100vh-6rem)] flex gap-4 px-4">
        {/* Sidebar links (behält Layout; aktive ID hier peerUserId) */}
        <div className="hidden md:block w-72 shrink-0">
          
          <ChatSidebar companyId={companyId} activePeerUserId={peerUserId}  />
        </div>

        {/* Chatbereich */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
            <div className="bg-white rounded-t-2xl shadow-sm border border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                  Chat{peerName ? ` – ${peerName}` : ""}
                </h1>
                {messagesLoading && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-3 h-3 border-2 border-gray-300 border-t-[#e60000] rounded-full animate-spin" />
                    Verlauf lädt...
                  </div>
                )}
                {isSending && !messagesLoading && (
                  <div className="text-xs text-gray-500">Senden...</div>
                )}
              </div>
            </div>

          {/* Chat Container */}
          <div className="flex-1 bg-white border-x border-gray-200 flex flex-col overflow-hidden">
            {messagesLoading && messages.length === 0 && (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2/3 h-12 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            )}
            {messages.length === 0 && !messagesLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Noch keine Nachrichten. Starte die Unterhaltung!
                </div>
              </div>
            )}

            {messages.length > 0 && (
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white"
              >
                {messages.map(m => (
                  <MessageBubble
                    key={m.id}
                    msg={m}
                    mine={m.senderUserId === myUserId}
                  />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="bg-white rounded-b-2xl border border-gray-200 px-4 py-4 shadow-lg">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Nachricht schreiben…"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#e60000]/20 focus:border-[#e60000] transition-all"
                  disabled={!myUserId || isSending}
                />
                <button
                  ref={emojiBtnRef}
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  onClick={() => setShowEmoji(v => !v)}
                  aria-label="Emoji auswählen"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>

                {showEmoji && (
                  <div
                    ref={emojiWrapRef}
                    className="absolute right-0 bottom-14 z-50 bg-white rounded-xl shadow-xl border border-gray-200"
                  >
                    <EmojiPicker
                      lazyLoadEmojis
                      searchDisabled
                      skinTonesDisabled
                      previewConfig={{ showPreview: false }}
                      onEmojiClick={(emoji: any) => {
                        const char = emoji?.emoji || "";
                        if (char) {
                          setText(prev => prev + char);
                          setShowEmoji(false);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              <button
                onClick={send}
                className="bg-gradient-to-r from-[#e60000] to-[#cc0000] text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                disabled={!myUserId || !text.trim() || isSending}
              >
                <span className="font-medium">
                  {isSending ? "Senden..." : "Senden"}
                </span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}