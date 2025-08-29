import React, { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";

export type GroupMemberStatus = "INVITED" | "ACTIVE" | "BLOCKED" | "DELETED";
export type ReactionType = "LIKE" | "LOL" | "SAD" | "ANGRY";

export type Group = {
  id: string;
  name: string;
  description?: string;
  adminId: string;
  members: GroupMember[];
  feedPosts: GroupFeedPost[];
};

export type GroupMember = {
  id: string;
  groupId: string;
  userId: string;
  status: GroupMemberStatus;
  invitedById?: string;
  joinedAt?: string;
  blockedAt?: string;
  deletedAt?: string;
};

export type GroupFeedPost = {
  id: string;
  groupId: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  imageSize?: number;
  createdAt: string;
  editedAt?: string;
  reactions: GroupFeedReaction[];
};

export type GroupFeedReaction = {
  id: string;
  postId: string;
  memberId: string;
  type: ReactionType;
  createdAt: string;
};

type GroupContextType = {
  groups: Group[];
  activeGroup?: Group;
  setActiveGroup: (group: Group | undefined) => void;
  refreshGroups: () => void;
  createGroup: (data: Partial<Group>) => Promise<void>;
  inviteMember: (groupId: string, userId: string) => Promise<void>;
  approveMember: (groupId: string, memberId: string) => Promise<void>;
  blockMember: (groupId: string, memberId: string) => Promise<void>;
  deleteMember: (groupId: string, memberId: string) => Promise<void>;
  addFeedPost: (groupId: string, post: Partial<GroupFeedPost>) => Promise<void>;
  reactToPost: (postId: string, memberId: string, type: ReactionType) => Promise<void>;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | undefined>(undefined);

  // Beispiel: Gruppen laden
  const refreshGroups = async () => {
    const res = await fetch("/api/groups");
    if (res.ok) {
      setGroups(await res.json());
    }
  };

  // Beispiel: Gruppe erstellen
  const createGroup = async (data: Partial<Group>) => {
    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await refreshGroups();
  };

  // Beispiel: Mitglied einladen
  const inviteMember = async (groupId: string, userId: string) => {
    await fetch(`/api/groups/${groupId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    await refreshGroups();
  };

  // Beispiel: Mitglied bestätigen
  const approveMember = async (groupId: string, memberId: string) => {
    await fetch(`/api/groups/${groupId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    await refreshGroups();
  };

  // Beispiel: Mitglied blockieren
  const blockMember = async (groupId: string, memberId: string) => {
    await fetch(`/api/groups/${groupId}/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    await refreshGroups();
  };

  // Beispiel: Mitglied löschen
  const deleteMember = async (groupId: string, memberId: string) => {
    await fetch(`/api/groups/${groupId}/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    await refreshGroups();
  };

  // Beispiel: Feed-Post hinzufügen
  const addFeedPost = async (groupId: string, post: Partial<GroupFeedPost>) => {
    await fetch(`/api/groups/${groupId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });
    await refreshGroups();
  };

  // Beispiel: Post markieren
  const reactToPost = async (postId: string, memberId: string, type: ReactionType) => {
    await fetch(`/api/groups/feed/${postId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, type }),
    });
    await refreshGroups();
  };

  useEffect(() => {
    refreshGroups();
  }, []);

  return (
    <GroupContext.Provider
      value={{
        groups,
        activeGroup,
        setActiveGroup,
        refreshGroups,
        createGroup,
        inviteMember,
        approveMember,
        blockMember,
        deleteMember,
        addFeedPost,
        reactToPost,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error("useGroups must be used within a GroupProvider");
  return ctx;
}

export function GroupList({ session }: { session: any }) {
  const { groups } = useGroups();

  const adminGroups = groups.filter(g => g.adminId === session?.user?.id);

  const memberGroups = groups.filter(g =>
    g.members.some(m => m.userId === session?.user?.id && m.status === "ACTIVE")
  );

  return (
    <>
      {session?.user?.role === "ENTERPRISE" && (
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-2">Als Admin angelegte Gruppen</h3>
          {adminGroups.length === 0 ? (
            <div className="text-gray-500">Keine eigenen Gruppen.</div>
          ) : (
            <ul className="space-y-2">
              {adminGroups.map(group => (
                <li key={group.id} className="flex items-center gap-2">
                  <Link
                    href={`/gruppen/${group.id}`}
                    className="text-[#e60000] hover:underline font-semibold"
                  >
                    {group.name}
                  </Link>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    Admin
                  </span>
                  <Link
                    href={`/gruppen-verwalten/${group.id}/edit`}
                    className="ml-2 text-gray-400 hover:text-[#e60000]"
                    title="Gruppe bearbeiten"
                  >
                    <Pencil size={18} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div>
        <h3 className="font-bold text-lg mb-2">Mitglied in Gruppen</h3>
        {memberGroups.length === 0 ? (
          <div className="text-gray-500">Sie sind noch kein Mitglied in anderen Gruppen.</div>
        ) : (
          <ul className="space-y-2">
            {memberGroups.map(group => (
              <li key={group.id} className="flex items-center gap-2">
                <Link
                  href={`/gruppen/${group.id}`}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  {group.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}