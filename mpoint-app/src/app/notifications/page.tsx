import { getServerSession } from "next-auth";
// Pfad ggf. anpassen
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import ExportCsv from "./ExportCsv";
import MarkAllRead from "./MarkAllRead";

export const runtime = "nodejs";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id;
  
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Zugriff verweigert</h2>
            <p className="text-gray-600">Bitte melden Sie sich an, um Ihre Benachrichtigungen zu sehen.</p>
          </div>
        </div>
      </div>
    );
  }
  
  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      url: true,
      isRead: true,
      createdAt: true,
    },
  });

  const unreadCount = items.filter(item => !item.isRead).length;

  const getCategoryStyle = (type: string) => {
    switch(type.toLowerCase()) {
      case 'match':
        return 'bg-gradient-to-r from-pink-500 to-rose-500 text-white';
      case 'message':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      case 'event':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white';
      case 'system':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      case 'payment':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      default:
        return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white';
    }
  };

  const getIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'match':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
        );
      case 'message':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'event':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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
    if (minutes < 60) return `vor ${minutes} Minute${minutes !== 1 ? 'n' : ''}`;
    if (hours < 24) return `vor ${hours} Stunde${hours !== 1 ? 'n' : ''}`;
    if (days < 7) return `vor ${days} Tag${days !== 1 ? 'en' : ''}`;
    
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8 mt-16 max-w-7xl">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Benachrichtigungen</h1>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-500">{unreadCount} ungelesene Nachrichten</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <form action="/api/notifications" method="post" className="hidden" />
              <MarkAllRead />
              <ExportCsv items={items.map(i => ({ ...i, createdAt: i.createdAt.toISOString() }))} />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Keine Benachrichtigungen</h3>
            <p className="text-gray-500">Sie haben aktuell keine neuen Benachrichtigungen.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <div 
                key={n.id} 
                className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${
                  !n.isRead ? 'border-red-200 bg-gradient-to-r from-red-50 to-white' : 'border-gray-100'
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon Section */}
                    <div className={`p-3 rounded-xl ${getCategoryStyle(n.type)} shadow-lg flex-shrink-0`}>
                      {getIcon(n.type)}
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              !n.isRead ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {n.type}
                            </span>
                            {!n.isRead && (
                              <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full">
                                NEU
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {n.url ? (
                              <a 
                                href={n.url} 
                                className="hover:text-red-600 transition-colors inline-flex items-center gap-1"
                              >
                                {n.title}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ) : (
                              n.title
                            )}
                          </h3>
                          
                          {n.body && (
                            <p className="text-gray-600 leading-relaxed line-clamp-2">
                              {n.body}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm text-gray-500">
                            {formatTime(new Date(n.createdAt))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}