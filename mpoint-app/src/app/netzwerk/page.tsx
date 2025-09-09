"use client";
import React, { useEffect, useState } from "react";
import {
  Bell,
  Clock,
  MapPin,
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
import { GroupProvider, useGroups, GroupList, GroupContent } from "@/context/GroupContext";
import { InvitationProvider, useInvitations } from "@/context/InvitationContext";
import NetworkSidebar from "../components/network/NetworkSidebar";
import MatchingList from "../dashboard/MatchingList"
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function NetzwerkPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "invitations" | "messages" | "connections" | "groups"
  >("invitations");
  const { data: session, status } = useSession();

  // URL / Hash auswerten (z.B. /netzwerk?tab=groups oder /netzwerk#groups)
  useEffect(() => {
    const q = searchParams.get("tab");
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    const candidate = (q || hash) as typeof activeTab;
    if (["invitations","messages","connections","groups"].includes(candidate)) {
      setActiveTab(candidate);
    }
  }, [searchParams]);

  // Optional: Hash-Fallback falls weiter #groups genutzt wird
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace("#", "");
      if (h === "groups") setActiveTab("groups");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function openGroupsTab() {
    setActiveTab("groups");
    // URL aktualisieren (optional)
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "groups");
    window.history.replaceState(null, "", url.toString());
  }

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
    <InvitationProvider>
      <GroupProvider>
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
        <NetworkSidebar />

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
                <InvitationsTabButton
                  active={activeTab === "invitations"}
                  onClick={() => setActiveTab("invitations")}
                />
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
                <GroupsTabContent session={session} />
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
                      <MatchingList layout="netzwerk" limit={3} />

                </div>
                <div className="text-center mt-6">
                  <a
                    href="/Matches/search"
                    className="inline-flex items-center gap-2 text-[#e60000] font-medium hover:gap-3 transition-all"
                  >
                    Alle Matches <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
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
      </GroupProvider>
    </InvitationProvider>
  );
}

// Innerhalb des Providers:
function GroupsTabContent({ session }: { session: any }) {
  const { groups } = useGroups();
  const [activeGroup, setActiveGroup] = useState<any | null>(null);

  const memberGroups = groups.filter(group =>
    group.members.some(
      member => member.userId === session?.user?.id && member.status === "ACTIVE"
    )
  );

  // Nur Gruppen, in denen der User KEIN Mitglied ist
  const availableGroups = groups.filter(group =>
    !group.members.some(
      member => member.userId === session?.user?.id && member.status === "ACTIVE"
    )
  );

  console.log("groups:", groups);
  console.log("availableGroups:", availableGroups);

  return (
    <div
      id="groups-content"
      className="bg-white/80 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-8 border border-white/50"
    >
      <Hash className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      {!activeGroup ? (
        <GroupList
          session={session}
          memberGroups={memberGroups}
          availableGroups={availableGroups}   // <--- jetzt korrekt!
          showOwnGroups={true}
          showMemberGroups={true}
          showAvailableGroups={true}
          showManageButton={true}
          setActiveGroup={setActiveGroup}
        />
      ) : (
        <GroupContent group={activeGroup} onBack={() => setActiveGroup(null)} />
      )}
    </div>
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

// Modern Invitations Tab Button Component
function InvitationsTabButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  const { invitations } = useInvitations();

  return (
    <button
      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
        active
          ? "bg-[#e60000] text-white shadow-lg"
          : "bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-200"
      }`}
      onClick={onClick}
    >
      <UserPlus className="w-4 h-4" />
      Einladungen
      <span className="ml-2 bg-[#e60000] text-white text-xs rounded-full px-2 py-0.5 font-bold">
        {invitations.length}
      </span>
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
  const { invitations, loading, acceptInvitation, declineInvitation } = useInvitations();

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Lade Einladungen...</div>;
  }

  if (invitations.length === 0) {
    return (
      <section className="bg-white/80 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-white/50 text-center">
        <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <div className="text-gray-500">Keine Einladungen vorhanden.</div>
      </section>
    );
  }

  return (
    <section className="bg-white/80 backdrop-blur rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-white/50">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Einladungen</h2>
      <ul className="space-y-4">
        {invitations.map(inv => (
          <InvitationItem
            key={inv.id}
            type={inv.group ? "group" : inv.event ? "event" : inv.contact ? "contact" : "group"} // <--- Typ setzen!
            title={inv.group?.name || inv.event?.name || inv.contact?.name || "Einladung"}
            description={inv.group?.description || inv.description}
            inviter={inv.invitedBy}
            group={inv.group}
            onAccept={() => acceptInvitation(inv)} // POST /api/groups/invitations/[id]/accept
            onDecline={() => declineInvitation(inv)} // POST /api/groups/invitations/[id]/decline
          />
        ))}
      </ul>
    </section>
  );
}

// Modern Invitation Item Component
function InvitationItem({
  type,
  title,
  description,
  inviter,
  onAccept,
  onDecline,
  group,
}: {
  type: "group" | "event" | "contact";
  title: string;
  description?: string;
  inviter?: { firstName?: string; lastName?: string };
  onAccept: () => void;
  onDecline: () => void;
  group?: { avatarUrl?: string };
}) {
  
  const getTypeConfig = () => {
    switch (type) {
      case "group":
        return {
          icon: Users,
          label: "Gruppen-Einladung",
          color: "from-blue-500 to-blue-600",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700"
        };
      case "event":
        return {
          icon: Calendar,
          label: "Event-Einladung",
          color: "from-green-500 to-green-600",
          bgColor: "bg-green-50",
          textColor: "text-green-700"
        };
      case "contact":
        return {
          icon: UserPlus,
          label: "Kontakt-Einladung",
          color: "from-purple-500 to-purple-600",
          bgColor: "bg-purple-50",
          textColor: "text-purple-700"
        };
      default:
        return {
          icon: Users,
          label: "Einladung",
          color: "from-gray-500 to-gray-600",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700"
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <li className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#e60000]/20 hover:scale-[1.01]">
      {/* Gradient Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e60000] to-[#c01a1f]"></div>
      
      <div className="p-6">
        {/* Header - Type Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${config.bgColor} ${config.textColor}`}>
            <Icon className="w-4 h-4" />
            {config.label}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>vor 2 Std.</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {type === "group" && group?.avatarUrl ? (
              <img
                src={group.avatarUrl}
                alt="Gruppen-Avatar"
                className="w-16 h-16 rounded-xl object-cover border-3 border-[#e60000]/20 shadow-lg group-hover:border-[#e60000]/40 transition-colors"
              />
            ) : (
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
            )}
            {/* Status Indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-[#e60000] transition-colors">
              {title}
            </h3>
            
            {description && (
              <p className="text-gray-600 leading-relaxed mb-3">
                {description}
              </p>
            )}
            
            {inviter && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600">
                    {inviter.firstName?.[0]}{inviter.lastName?.[0]}
                  </span>
                </div>
                <span>
                  Eingeladen von <span className="font-semibold">{inviter.firstName} {inviter.lastName}</span>
                </span>
              </div>
            )}

            {/* Additional Meta Info */}
        
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-6 py-2.5 bg-gradient-to-r from-[#e60000] to-[#c01a1f] text-white rounded-xl font-semibold hover:from-[#c01a1f] hover:to-[#a01216] hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={onAccept}
            >
              Annehmen
            </button>
            <button
              type="button"
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={onDecline}
            >
              Ablehnen
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#e60000]/0 via-[#e60000]/0 to-[#e60000]/0 group-hover:from-[#e60000]/5 group-hover:via-transparent group-hover:to-[#e60000]/5 transition-all duration-300 pointer-events-none"></div>
    </li>
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
