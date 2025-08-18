"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import ChatSidebar from "../ChatSidebar";
import dynamic from "next/dynamic"; // <- hinzugefügt

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false }); // <- hinzugefügt

// URLs und Emails im Text als Links rendern
function linkify(text: string) {
  const TOKEN =
    /(https?:\/\/[^\s]+|www\.[^\s]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

  return text.split(TOKEN).map((part, i) => {
    if (!part) return null;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part);
    const isUrl = /^(https?:\/\/[^\s]+|www\.[^\s]+)/i.test(part);

    if (!isEmail && !isUrl) return <span key={i}>{part}</span>;

    // ggf. www. auf https:// präfixen
    const href = isEmail
      ? `mailto:${part}`
      : part.startsWith("http")
      ? part
      : `https://${part}`;

    // trailing Satzzeichen nicht verlinken (.,!?) — optional
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

export default function ChatPage() {
  const { data: session } = useSession();
  const { matchId } = useParams<{ matchId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);           // lädt companyId
  const [messagesLoading, setMessagesLoading] = useState(false); // lädt History
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [partner, setPartner] = useState<{ id: string; name: string } | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);                 // <- hinzugefügt
  const emojiBtnRef = useRef<HTMLButtonElement>(null);               // <- hinzugefügt
  const emojiWrapRef = useRef<HTMLDivElement>(null);                 // <- hinzugefügt

  // companyId laden
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

  // History laden, danach Stream öffnen
  useEffect(() => {
    if (!matchId || !companyId) return;

    setMessagesLoading(true);
    let es: EventSource | null = null;

    fetch(`/api/chat/history?matchId=${matchId}&companyId=${companyId}`)
      .then(r => r.json())
      .then(d => {
        setMessages(d.messages || []);
        if (d.partner) setPartner(d.partner);

        // Stream erst nach History öffnen
        es = new EventSource(`/api/chat/stream?matchId=${matchId}&companyId=${companyId}`);
        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === "message") setMessages(prev => [...prev, data.message]);
          } catch {}
        };
      })
      .finally(() => setMessagesLoading(false));

    return () => { es?.close(); };
  }, [matchId, companyId]);

  // Scroll nur wenn Nachrichten da sind
  useEffect(() => {
    if (messagesLoading) return;
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length, messagesLoading]);

  // Emoji-Popover schließen bei Klick außerhalb / ESC
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
    e?.preventDefault(); // Verhindert Page-Jump
    if (!text.trim() || !matchId || !companyId || !session?.user?.id) return;
    
    const res = await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        content: text.trim(),
        companyId,                 // <- erforderlich
        senderUserId: session.user.id // <- erforderlich
      })
    });
    if (res.ok) setText("");
  }

  const myUserId = session?.user?.id;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-25 pb-4">
      <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex gap-4 px-4">
        {/* Sidebar links */}
        <div className="hidden md:block w-72 shrink-0">
          <ChatSidebar companyId={companyId} activeMatchId={String(matchId)} />
        </div>

        {/* Chatbereich rechts */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white rounded-t-2xl shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">Chat</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {partner?.name ?? "Empfänger-Unternehmen"}
                </span>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div className="flex-1 bg-white border-x border-gray-200 flex flex-col overflow-hidden">
            {(loading || messagesLoading) && (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Lade Chat…
                </div>
              </div>
            )}

            {!loading && !messagesLoading && !companyId && (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                  Keine companyId gefunden. Bitte prüfe /api/company?userId=…
                </div>
              </div>
            )}

            {!loading && !messagesLoading && companyId && (
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white"
              >
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-20">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Noch keine Nachrichten. Starte die Unterhaltung!
                  </div>
                )}
                
                {messages.map(m => {
                  const mine = m.senderUserId === myUserId;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"} animate-fadeIn`}>
                      <div className={`group relative max-w-[70%] ${mine ? "order-1" : ""}`}>
                        <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                          mine 
                            ? "bg-gradient-to-br from-[#e60000] to-[#cc0000] text-white rounded-br-sm" 
                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                        }`}>
                          <p className="text-sm leading-relaxed break-words">
                            {linkify(m.content)}
                          </p>
                          <div className={`mt-1.5 text-[10px] ${mine ? "text-white/80" : "text-gray-400"}`}>
                            {new Date(m.createdAt).toLocaleTimeString('de-DE', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={send} className="bg-white rounded-b-2xl border border-gray-200 px-4 py-4 shadow-lg">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Nachricht schreiben…"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#e60000]/20 focus:border-[#e60000] transition-all"
                  disabled={!companyId || !myUserId || messagesLoading}
                />
                <button
                  ref={emojiBtnRef}
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  onClick={() => setShowEmoji(v => !v)}
                  aria-label="Emoji auswählen"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                          // Picker nach Auswahl schließen (optional)
                          setShowEmoji(false);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              <button 
                type="submit"
                className="bg-gradient-to-r from-[#e60000] to-[#cc0000] text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2" 
                disabled={!companyId || !myUserId || !text.trim() || messagesLoading}
              >
                <span className="font-medium">Senden</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

