import React, { useEffect, useState, createContext, useContext } from "react";
import { Pencil, Users } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

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
  reactToPost: (groupId: string, postId: string, memberId: string, type: ReactionType) => Promise<void>;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<any[]>([]);
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
  const reactToPost = async (groupId: string, postId: string, memberId: string, type: ReactionType) => {
    await fetch(`/api/groups/${groupId}/feed/${postId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, type }),
    });
    await refreshGroups();
  };

  // Automatisches Polling alle 10 Sekunden
  useEffect(() => {
    refreshGroups(); // Initiales Laden
    const interval = setInterval(() => {
      refreshGroups();
    }, 10000); // alle 10 Sekunden
    return () => clearInterval(interval);
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

export function GroupList({
  session,
  memberGroups = [],
  availableGroups = [],
  ownGroups = [],
  showOwnGroups = true,
  showMemberGroups = true,
  showAvailableGroups = true,
  showManageButton = true,
  setActiveGroup,
}: {
  session: any;
  memberGroups?: any[];
  availableGroups?: any[];
  ownGroups?: any[];
  showOwnGroups?: boolean;
  showMemberGroups?: boolean;
  showAvailableGroups?: boolean;
  showManageButton?: boolean;
  setActiveGroup?: (group: any) => void;
}) {
  // Zentrale Definition der max. Länge
  const DESCRIPTION_MAX_LENGTH = 120;

  // Hilfsfunktion für die Kürzung
  const getShortDescription = (desc?: string) =>
    desc && desc.length > DESCRIPTION_MAX_LENGTH
      ? desc.slice(0, DESCRIPTION_MAX_LENGTH) + "..."
      : desc;

  return (
    <div>
      {/* Eigene Gruppen */}
      {showOwnGroups && session?.user?.role === "ENTERPRISE" && ownGroups.length > 0 && (
        <div id="my-own-groups" className="mb-8">
          <h3 className="font-bold text-lg mb-2">Meine eigenen Gruppen</h3>
          <ul className="space-y-4">
            {ownGroups.map(group => (
              <li key={group.id} className="flex items-center gap-4 bg-white rounded-xl shadow p-4 border">
                {group.avatarUrl ? (
                  <img src={group.avatarUrl} alt="Gruppen-Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-[#e60000] bg-white" />
                ) : (
                  <Users className="w-12 h-12 text-gray-300 bg-gray-100 rounded-full p-2" />
                )}
                <div className="flex-1">
                  <span className="text-blue-600 font-semibold text-lg">{group.name}</span>
                  {group.description && (
                    <div className="text-gray-600 text-sm mt-1">
                      {getShortDescription(group.description)}
                    </div>
                  )}
                </div>
                {/* Edit-Button */}
                <Link
                  href={`/gruppen-verwalten/${group.id}/edit`}
                  className="ml-2 text-gray-400 hover:text-[#e60000]"
                  title="Gruppe bearbeiten"
                >
                  <Pencil className="w-6 h-6" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mitglied in Gruppen */}
      {showMemberGroups && (
        <>
          <h3 className="font-bold text-lg mb-2">Meine Gruppen</h3>
          {memberGroups.length === 0 ? (
            <div className="text-gray-500 mb-6">Sie sind noch kein Mitglied in Gruppen.</div>
          ) : (
            <ul className="space-y-4 mb-8">
              {memberGroups.map(group => (
                <GroupListItem
                  key={group.id}
                  group={group}
                  setActiveGroup={setActiveGroup}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {/* Alle sichtbaren Gruppen */}
      {showAvailableGroups && (
        <>
          <h3 className="font-bold text-lg mb-2">Alle Gruppen</h3>
          {availableGroups.length === 0 ? (
            <div className="text-gray-500 mb-6">Keine weiteren Gruppen sichtbar.</div>
          ) : (
            <ul className="space-y-4 mb-8">
              {availableGroups.map(group => (
                <GroupListItem key={group.id} group={group} />
              ))}
            </ul>
          )}
        </>
      )}

      {/* Gruppen verwalten Button */}
      {session?.user?.role === "ENTERPRISE" && showManageButton && (
        <div id="my-own-groups" className="mt-8 text-center">
          <Link
            href="/gruppen-verwalten"
            className="inline-block px-6 py-3 bg-[#e60000] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Gruppen verwalten
          </Link>
        </div>
      )}
    </div>
  );
}

export function GroupContent({ group }: { group: any }) {
  const [newPost, setNewPost] = useState("");
  const [feed, setFeed] = useState<GroupFeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  // Eigene GroupMember-ID finden
  const memberId = group.members.find(
    m => m.userId === session?.user?.id && m.status === "ACTIVE"
  )?.id;

  // Neuen Post per API anlegen und Feed aktualisieren
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) {
      alert("Bitte gib einen Beitrag ein.");
      return;
    }
    if (!memberId) {
      alert("Du bist kein aktives Gruppenmitglied und kannst keinen Beitrag posten.");
      return;
    }
    setLoading(true);

    // API-Call: neuen Post anlegen, authorId = memberId!
    const res = await fetch(`/api/groups/${group.id}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newPost, authorId: memberId }),
    });

    if (res.ok) {
      setNewPost("");
      // Feed neu laden
      const feedRes = await fetch(`/api/groups/${group.id}/feed`);
      if (feedRes.ok) {
        const posts = await feedRes.json();
        setFeed(posts);
      }
    } else {
      alert("Fehler beim Speichern des Beitrags.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchFeed = async () => {
      const res = await fetch(`/api/groups/${group.id}/feed`);
      if (res.ok) {
        const posts = await res.json();
        setFeed(posts);
      }
    };
    fetchFeed();
  }, [group.id]);

  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow">
      {/* Block 1: Avatar, Name, Description */}
      <div className="flex items-center gap-4 mb-4">
        {group.avatarUrl ? (
          <img src={group.avatarUrl} alt="Gruppen-Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#e60000] bg-white" />
        ) : (
          <Users className="w-16 h-16 text-gray-300 bg-gray-100 rounded-full p-2" />
        )}
        <div>
          <div className="font-bold text-2xl text-[#e60000]">{group.name}</div>
          {group.description && (
            <div className="text-gray-600 text-base mt-1">{group.description}</div>
          )}
        </div>
      </div>

      {/* Block 2: Neues Post-Feld */}
      <form onSubmit={handlePost} className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 mb-8">
        <textarea
          className="border rounded p-3 w-full"
          rows={3}
          placeholder="Neuen Beitrag verfassen..."
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
        />
        <button
          type="submit"
          className="self-end px-4 py-2 bg-[#e60000] text-white rounded font-semibold hover:bg-red-700"
          disabled={loading || !newPost.trim()}
        >
          Beitrag posten
        </button>
      </form>

      {/* Block 3: Post-Feed */}
      <div>
        <h4 className="font-bold text-lg mb-4">Beiträge</h4>
        {feed.length === 0 ? (
          <div className="text-gray-500">Noch keine Beiträge in dieser Gruppe.</div>
        ) : (
          <ul className="space-y-6">
            {feed.map(post => (
              <PostBlock key={post.id} post={post} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PostBlock({ post }: { post: any }) {
  const { reactToPost, activeGroup } = useGroups();
  const { data: session } = useSession();
  const reactionTypes = ["LIKE", "LOL", "SAD", "ANGRY"];

  // Eigene GroupMember-ID finden mit Fehlerbehandlung
  let memberId: string | undefined;
  if (activeGroup && session?.user?.id) {
    console.log("Session User ID:", session.user.id);
    console.log("ActiveGroup Members:", activeGroup.members);
    const member = activeGroup.members.find(
      m => String(m.userId) === String(session.user.id) && m.status === "ACTIVE"
    );
    if (member) {
      memberId = member.id;
    } else {
      console.warn("Kein aktives Gruppenmitglied für diesen User gefunden.");
    }
  } else {
    console.warn("activeGroup oder session.user.id nicht definiert.");
  }

  const handleReaction = async (type: string) => {
    if (!memberId) {
      alert("Du bist kein aktives Gruppenmitglied und kannst nicht reagieren.");
      return;
    }
    await reactToPost(post.groupId, post.id, memberId, type);
  };

  return (
    <li className="bg-white rounded-xl shadow p-4 border flex gap-4">
      {/* Avatar des Autors */}
      {post.author?.avatarUrl ? (
        <img src={post.author.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border" />
      ) : (
        <Users className="w-10 h-10 text-gray-300 bg-gray-100 rounded-full p-2" />
      )}
      <div className="flex-1">
        <div className="font-semibold text-gray-900">{post.author?.firstName} {post.author?.lastName}</div>
        <div className="text-gray-700 mt-1">{post.content}</div>
        {/* Reaktionen */}
        <div className="flex gap-2 mt-2">
          {post.reactions?.map((reaction: any) => (
            <span key={reaction.id} className="px-2 py-1 rounded bg-gray-100 text-xs font-semibold">
              {reaction.type}
            </span>
          ))}
        </div>
        {/* Aktionen */}
        <div className="flex gap-4 mt-2">
          <button className="text-blue-600 hover:underline text-xs">Antworten</button>
          <button className="text-gray-600 hover:underline text-xs">Weiterleiten</button>
          {/* Reaktions-Buttons */}
          {reactionTypes.map(type => (
            <button
              key={type}
              className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-[#e60000] hover:text-white font-semibold"
              onClick={() => handleReaction(type)}
              title={`Mit ${type} reagieren`}
              disabled={!memberId}
            >
              {type}
            </button>
          ))}
        </div>
        {!memberId && (
          <div className="text-red-500 text-xs mt-2">
            Du bist kein aktives Gruppenmitglied und kannst nicht reagieren.
          </div>
        )}
      </div>
    </li>
  );
}

function GroupListItem({ group, setActiveGroup }: { group: any, setActiveGroup?: (group: any) => void }) {
  const DESCRIPTION_MAX_LENGTH = 120;
  const [open, setOpen] = useState(false);

  const shortText = group.description?.slice(0, DESCRIPTION_MAX_LENGTH);

  return (
    <li className="flex gap-4 bg-white rounded-xl shadow p-4 border items-start">
      {/* Icon und Name nebeneinander */}
      <div className="flex items-center gap-2">
        {group.avatarUrl ? (
          <img src={group.avatarUrl} alt="Gruppen-Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-[#e60000] bg-white" />
        ) : (
          <Users className="w-12 h-12 text-gray-300 bg-gray-100 rounded-full p-2" />
        )}
        <button
          className="text-blue-600 hover:underline font-semibold text-lg text-left"
          onClick={() => setActiveGroup && setActiveGroup(group)}
        >
          {group.name}
        </button>
      </div>
      {/* Beschreibung unterhalb von Name+Icon */}
      <div className="flex-1">
        {group.description && (
          <div className="text-gray-600 text-sm mt-1">
            {group.description.length > DESCRIPTION_MAX_LENGTH ? (
              <>
                {shortText}
                {!open && (
                  <>
                    ...{" "}
                    <button
                      className="text-xs text-[#e60000] underline"
                      onClick={() => setOpen(true)}
                    >
                      Mehr anzeigen
                    </button>
                  </>
                )}
                {open && (
                  <span>
                    {group.description.slice(DESCRIPTION_MAX_LENGTH)}
                    {" "}
                    <button
                      className="text-xs text-[#e60000] underline"
                      onClick={() => setOpen(false)}
                    >
                      Weniger anzeigen
                    </button>
                  </span>
                )}
              </>
            ) : (
              group.description
            )}
          </div>
        )}
      </div>
    </li>
  );
}