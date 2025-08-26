"use client";
import React, { useState } from "react";
import {
  Bell,
  Search,
  Users,
  Calendar,
  Building2,
  UserPlus,
  MessageSquare,
  Link2,
  Hash,
  ChevronDown,
  TrendingUp,
  Eye,
  Sparkles,
  Star,
  ArrowRight,
  Menu,
  Network,
  X,
  Funnel,
  Activity
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function NetzwerkPage() {
  const [activeTab, setActiveTab] = useState<
    "invitations" | "messages" | "connections" | "groups"
  >("invitations");
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Anmeldung erforderlich
          </h2>
          <p className="mb-6 text-gray-600">
            Bitte loggen Sie sich ein, um Ihre Unternehmens-Matches zu sehen.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-[rgb(228,25,31)] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Zum Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-4">
            <Network className="w-8 h-8 text-[#e60000]" />
            Netzwerk
          </h1>
          <p className="text-gray-600">
            Hier finden Sie alle Informationen zu Ihren Kontakten, Gruppen und
            Aktivitäten.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-6 pb-8 flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
          <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Ihr Netzwerk
              </h2>
              <Network className="w-6 h-6 text-[#e60000]" />
            </div>

            <div className="space-y-3">
              <SidebarStat
                label="M-POINT Kontakte"
                icon={<Users className="w-5 h-5 text-[#e60000]" />}
                count={256}
              />
              <SidebarStat
                label="Folgen & Follower"
                icon={<UserPlus className="w-5 h-5 text-purple-500" />}
                count={142}
              />
              <SidebarStat
                label="Gruppen"
                icon={<Hash className="w-5 h-5 text-blue-500" />}
                count={12}
              />
              <SidebarStat
                label="Events"
                icon={<Calendar className="w-5 h-5 text-green-500" />}
                count={8}
              />
              <SidebarStat
                label="Unternehmen"
                icon={<Building2 className="w-5 h-5 text-orange-500" />}
                count={15}
              />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Smart Filter
              </h2>
              <Funnel className="w-6 h-6 text-[#e60000]" />
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked
                  readOnly
                  className="w-5 h-5 text-[#e60000] rounded-md focus:ring-[#e60000] cursor-pointer"
                />
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                  Branche: IT & Tech
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked
                  readOnly
                  className="w-5 h-5 text-[#e60000] rounded-md focus:ring-[#e60000] cursor-pointer"
                />
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                  Region: NRW
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-[#e60000] rounded-md focus:ring-[#e60000] cursor-pointer"
                />
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                  Premium-Mitglieder
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* Center Content */}
        <div className="flex-1 min-w-0">
          {/* Modern Search Bar */}
          <div className="flex flex-col md:flex-row mb-6">
            <div className="flex-1 flex items-center bg-white rounded-lg shadow-sm px-4 py-2">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                className="flex-1 outline-none bg-transparent text-gray-900"
                placeholder="Nach Kontakten, Unternehmen oder Themen suchen..."
              />
            </div>
          </div>

          {/* Modern Tab Navigation */}
          <nav className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <TabButton
              active={activeTab === "invitations"}
              onClick={() => setActiveTab("invitations")}
            >
              <UserPlus className="w-4 h-4" />
              Einladungen
              <span className="ml-2 bg-[#e60000] text-white text-xs rounded-full px-2 py-0.5 font-bold">
                15
              </span>
            </TabButton>
            <TabButton
              active={activeTab === "messages"}
              onClick={() => setActiveTab("messages")}
            >
              <MessageSquare className="w-4 h-4" />
              Nachrichten
              <span className="ml-2 bg-[#e60000] text-white text-xs rounded-full px-2 py-0.5 font-bold">
                3
              </span>
            </TabButton>
            <TabButton
              active={activeTab === "connections"}
              onClick={() => setActiveTab("connections")}
            >
              <Link2 className="w-4 h-4" />
              Verbindungen
            </TabButton>
            <TabButton
              active={activeTab === "groups"}
              onClick={() => setActiveTab("groups")}
            >
              <Hash className="w-4 h-4" />
              Gruppen
            </TabButton>
          </nav>

          {/* Tab Content */}
          {activeTab === "invitations" && <InvitationsSection />}
          {activeTab === "messages" && <MessagesSection />}
          {activeTab === "connections" && (
            <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-8 text-center border border-white/50">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Verbindungen-Ansicht: Zeigt alle Ihre M-POINT Kontakte.
              </p>
            </div>
          )}
          {activeTab === "groups" && (
            <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-8 text-center border border-white/50">
              <Hash className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Gruppen-Ansicht: Zeigt Ihre Branchengruppen und
                Interessensgemeinschaften.
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg text-gray-900">AI-Matches</h2>
              <Sparkles className="w-6 h-6 text-[#e60000]" />
            </div>
            <div className="space-y-4">
              <SuggestionItem
                name="Dr. Lisa Chen"
                title="CEO • AI Solutions GmbH"
                match={95}
              />
              <SuggestionItem
                name="Thomas Berg"
                title="CTO • TechStart Berlin"
                match={88}
              />
              <SuggestionItem
                name="Julia Hoffmann"
                title="Investor • NRW Ventures"
                match={82}
              />
            </div>
            <div className="text-center mt-6">
              <a
                href="#"
                className="inline-flex items-center gap-2 text-[#e60000] font-medium hover:gap-3 transition-all"
              >
                Alle Matches <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Ihre Performance
              </h2>
              <Activity className="w-6 h-6 text-[#e60000]" />
            </div>
            <div className="space-y-4">
              <QuickStat
                icon={<Eye className="w-5 h-5" />}
                label="Profilaufrufe"
                value={47}
                trend="+12%"
              />
              <QuickStat
                icon={<Star className="w-5 h-5" />}
                label="Neue Matches"
                value={12}
                trend="+5%"
                highlight
              />
              <QuickStat
                icon={<TrendingUp className="w-5 h-5" />}
                label="Engagement Rate"
                value="89%"
                trend="+3%"
              />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

// Modern Sidebar Stat Component
function SidebarStat({
  label,
  icon,
  count,
}: {
  label: string;
  icon: React.ReactNode;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer hover:shadow-md transition-all group">
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

// Modern Tab Button Component
function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
        active
          ? "bg-[#e60000] text-white shadow-lg"
          : "bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-200"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Modern Suggestion Item Component
function SuggestionItem({
  name,
  title,
  match,
}: {
  name: string;
  title: string;
  match: number;
}) {
  return (
    <div className="group p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="relative bg-gray-300 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
            {name.split(" ")[1]?.[0] || "?"}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#e60000] font-bold text-sm">
              {match}% Match
            </span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(match / 20)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="font-bold text-gray-900 truncate">{name}</div>
          <div className="text-gray-500 text-sm truncate">{title}</div>
        </div>
      </div>
      <button className="mt-3 w-full bg-[#e60000] hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all cursor-pointer">
        Vernetzen
      </button>
    </div>
  );
}

// Modern Quick Stat Component
function QuickStat({
  icon,
  label,
  value,
  trend,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            highlight
              ? "bg-[#e60000]/10 text-[#e60000]"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {icon}
        </div>
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
      <div className="text-right">
        <span
          className={`font-bold text-lg ${
            highlight ? "text-[#e60000]" : "text-gray-900"
          }`}
        >
          {value}
        </span>
        <div className="text-xs text-green-600 font-medium">{trend}</div>
      </div>
    </div>
  );
}

// Modern Invitations Section
function InvitationsSection() {
  return (
    <section className="bg-white/80 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-white/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Netzwerk erweitern</h2>
        <Network className="w-6 h-6 text-[#e60000]" />
      </div>
      <div className="space-y-4">
        <InvitationItem
          name="Thomas Thelen"
          title="Die Zukunft der Arbeit neu denken | Intelligente Automatisierung"
          mutual="Jan Schellenberger und 3 weitere gemeinsame Kontakte"
          type="connection"
        />
        <InvitationItem
          name="Fabian Leweke"
          title="hat Sie eingeladen, JOBS.PSA.PAGE zu folgen"
          mutual="Unternehmensseite • IT-Services"
          type="page"
        />
        <InvitationItem
          name="Thomas Hruska"
          title="hat Sie zur Teilnahme an KMU KI Forum eingeladen"
          mutual="Event • Fr. 25. Juli, 09:00"
          type="event"
        />
      </div>
      <div className="text-center my-6">
        <a
          href="#"
          className="inline-flex items-center gap-2 text-[#e60000] font-medium hover:gap-3 transition-all"
        >
          Alle Matches <ArrowRight className="w-4 h-4" />
        </a>
      </div>

    </section>
  );
}

// Modern Invitation Item Component
function InvitationItem({
  name,
  title,
  mutual,
  type,
}: {
  name: string;
  title: string;
  mutual: string;
  type: "connection" | "page" | "event";
}) {
  const getIcon = () => {
    switch (type) {
      case "connection":
        return <UserPlus className="w-5 h-5" />;
      case "page":
        return <Building2 className="w-5 h-5" />;
      case "event":
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getActions = () => {
    switch (type) {
      case "connection":
        return ["Ignorieren", "Annehmen"];
      case "page":
        return ["Ignorieren", "Folgen"];
      case "event":
        return ["Ignorieren", "Details"];
    }
  };

  return (
    <div className="group p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="relative bg-gray-400 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
            {name.split(" ")[0]?.[0] || "?"}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
            <div className="text-gray-600">{getIcon()}</div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900">{name}</div>
          <div className="text-gray-600 text-sm mt-1">{title}</div>
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            {mutual}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {getActions().map((action, idx) => (
            <button
              key={action}
              className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer  ${
                idx === 0
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-[#e60000] hover:bg-red-700 text-white"
              }`}
              onClick={() => alert(`Aktion: ${action}`)}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Modern Messages Section
function MessagesSection() {
  return (
    <section className="bg-white/80 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-white/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Nachrichten</h2>
        <a
          href="#"
          className="inline-flex items-center gap-2 text-[#e60000] text-sm font-medium hover:gap-3 transition-all"
        >
          Alle anzeigen <ArrowRight className="w-4 h-4" />
        </a>
      </div>
      <div className="space-y-4">
        <MessageItem
          name="Sarah Weber"
          preview="Hallo Herr Alraai, vielen Dank für Ihre Kontaktanfrage. Ich würde gerne..."
          time="vor 2 Std."
          unread
        />
        <MessageItem
          name="Michael Schmidt"
          preview="Bezüglich unseres Gesprächs beim letzten Event: Hier sind die Unterlagen..."
          time="vor 5 Std."
          unread
        />
        <MessageItem
          name="Anna Meyer"
          preview="Perfekt, dann sehen wir uns nächste Woche beim Innovation Summit!"
          time="gestern"
        />
        <MessageItem
          name="Klaus Müller"
          preview="Danke für die Präsentation. Sehr interessante Ansätze!"
          time="vor 2 Tagen"
        />
      </div>
    </section>
  );
}

// Modern Message Item Component
function MessageItem({
  name,
  preview,
  time,
  unread,
}: {
  name: string;
  preview: string;
  time: string;
  unread?: boolean;
}) {
  return (
    <div
      className={`group p-4 rounded-xl cursor-pointer transition-all ${
        unread ? "bg-[#e60000]/5 hover:bg-[#e60000]/10" : "hover:bg-gray-100"
      }`}
      onClick={() => alert("Chat-Fenster würde sich öffnen...")}
    >
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="relative bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
            {name.split(" ")[0]?.[0] || "?"}
          </div>
          {unread && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#e60000] rounded-full animate-pulse"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="font-bold text-gray-900">{name}</div>
            <div className="text-xs text-gray-500 flex-shrink-0">{time}</div>
          </div>
          <div className="text-gray-600 text-sm mt-1 truncate">{preview}</div>
        </div>
      </div>
    </div>
  );
}
