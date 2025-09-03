"use client";
import { useEffect, useState } from "react";
import { GroupProvider, GroupList, useGroups } from "@/context/GroupContext";
import { useSession } from "next-auth/react";
import Link from "next/link";

function RequestsTab({ session }: { session: any }) {
  const { groups, approveMember, deleteMember } = useGroups();

  // Nur eigene Gruppen
  const adminGroups = groups.filter((g) => g.adminId === session?.user?.id);
  // Alle Anfragen aus eigenen Gruppen
  const requests = adminGroups.flatMap((g) =>
    g.members
      .filter((m) => m.status === "REQUEST")
      .map((m) => ({ group: g, member: m }))
  );

  return (
    <div className="mt-8">
      <h3 className="font-bold text-lg mb-4">Beitrittsanfragen</h3>
      {requests.length === 0 ? (
        <div className="text-gray-500">Keine offenen Anfragen.</div>
      ) : (
        <ul>
          {requests.map(({ group, member }) => (
            <li key={member.id} className="mb-4 flex items-center gap-4">
              <span>
                <b>
                  {member.user?.firstName} {member.user?.lastName}
                </b>{" "}
                möchte in <b>{group.name}</b> aufgenommen werden.
              </span>
              <button
                className="px-2 py-1 bg-green-600 text-white rounded text-xs mr-2"
                onClick={() => approveMember(group.id, member.id)}
              >
                Zustimmen
              </button>
              <button
                className="px-2 py-1 bg-gray-400 text-white rounded text-xs"
                onClick={() => deleteMember(group.id, member.id)}
              >
                Ablehnen
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function GruppenVerwaltenPage() {
  const { data: session, status } = useSession();
  const [ownGroups, setOwnGroups] = useState([]);
  const [activeTab, setActiveTab] = useState<"groups" | "requests">("groups");

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/groups?adminId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => setOwnGroups(data));
    }
  }, [session?.user?.id]);

  if (status === "unauthenticated" || session?.user?.role !== "ENTERPRISE") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Kein Zugriff</h2>
          <p className="mb-6 text-gray-600">
            Diese Seite ist nur für ENTERPRISE-User verfügbar.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[rgb(228,25,31)] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Zur Startseite
          </a>
        </div>
      </main>
    );
  }

  return (
    <GroupProvider>
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-[#e60000]">Gruppen verwalten</h1>
            <Link
              href="/gruppen-verwalten/new"
              className="px-6 py-3 bg-[#e60000] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Gruppe anlegen
            </Link>
          </div>
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              className={`px-4 py-2 rounded font-semibold ${
                activeTab === "groups"
                  ? "bg-[#e60000] text-white"
                  : "bg-white text-[#e60000] border"
              }`}
              onClick={() => setActiveTab("groups")}
            >
              Eigene Gruppen
            </button>
            <RequestsTabLabel
              session={session}
              active={activeTab === "requests"}
              onClick={() => setActiveTab("requests")}
            />
          </div>
          {/* Tab-Inhalte */}
          {activeTab === "groups" && (
            <GroupList
              session={session}
              ownGroups={ownGroups}
              showOwnGroups={true}
              showMemberGroups={false}
              showAvailableGroups={false}
              memberGroups={[]}
              availableGroups={[]}
              showManageButton={false}
            />
          )}
          {activeTab === "requests" && <RequestsTab session={session} />}
        </div>
      </main>
    </GroupProvider>
  );
}

// Tab-Label mit Anfrage-Anzahl
function RequestsTabLabel({
  session,
  active,
  onClick,
}: {
  session: any;
  active: boolean;
  onClick: () => void;
}) {
  const { groups } = useGroups();
  const adminGroups = groups.filter((g) => g.adminId === session?.user?.id);
  const requestsCount = adminGroups.reduce(
    (sum, g) => sum + g.members.filter((m) => m.status === "REQUEST").length,
    0
  );
  return (
    <button
      className={`px-4 py-2 rounded font-semibold ${
        active ? "bg-[#e60000] text-white" : "bg-white text-[#e60000] border"
      }`}
      onClick={onClick}
    >
      Anfragen
      {requestsCount > 0 ? ` (${requestsCount})` : ""}
    </button>
  );
}