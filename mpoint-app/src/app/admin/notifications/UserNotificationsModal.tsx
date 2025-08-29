"use client";
import { useEffect, useState } from "react";

interface Props {
  user: any | null;
  onClose: () => void;
  limit?: number;
}

export default function UserNotificationsModal({ user, onClose, limit = 100 }: Props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    let abort = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/notifications?userId=${user.id}&limit=${limit}`, { cache: "no-store" });
        if (!abort && res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } finally {
        if (!abort) setLoading(false);
      }
    }
    load();
    return () => { abort = true; };
  }, [user, limit]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-100">
        
        {/* Modern Header with M-POINT Branding */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* M-POINT Logo */}
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">🅼</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Notifications
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-white/90 text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                  <span className="text-white/70 text-xs">{user.email}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
              title="Schließen"
            >
              <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
                  <div className="w-8 h-8 border-4 border-transparent border-t-red-400 rounded-full animate-spin absolute top-2 left-2"></div>
                </div>
                <p className="text-gray-600 text-sm mt-4 font-medium">Lade Notifications...</p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 px-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5-5-5h5v-10h5v10z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Notifications</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Hier erscheinen Benachrichtigungen, sobald neue Aktivitäten für diesen User vorhanden sind.
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {items.map(n => (
                  <div
                    key={n.id}
                    className={`group relative bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                      n.isRead 
                        ? "border-gray-200 hover:border-gray-300" 
                        : "border-red-200 bg-red-50/30 hover:border-red-300 shadow-sm"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        
                        {/* Notification Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                          n.isRead ? "bg-gray-100" : "bg-red-100"
                        }`}>
                          {!n.isRead ? (
                            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                          ) : (
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5-5-5h5v-10h5v10z" />
                            </svg>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-3">
                            <h4 className="font-semibold text-gray-900 text-base leading-tight">
                              {n.title}
                            </h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                n.type === 'FEHLER' ? 'bg-red-100 text-red-700' :
                                n.type === 'WARNUNG' ? 'bg-amber-100 text-amber-700' :
                                n.type === 'ERFOLG' ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {n.type}
                              </span>
                              {!n.isRead && (
                                <span className="text-xs px-2 py-0.5 rounded-md bg-red-600 text-white font-bold tracking-wide">
                                  NEU
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {n.body && (
                            <p className="text-gray-700 text-sm leading-relaxed mb-4">
                              {n.body}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-medium">
                              {new Date(n.createdAt).toLocaleString('de-DE', {
                                day: '2-digit',
                                month: '2-digit', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            
                            {n.url && (
                              <a
                                href={n.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                              >
                                Öffnen
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Subtle border accent */}
                    {!n.isRead && (
                      <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-100 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🅼</span>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">M-POINT 3.0</div>
                <div className="text-xs text-gray-500">Business Matching</div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}