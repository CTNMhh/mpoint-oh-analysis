import React, { useEffect, useState, createContext, useContext } from "react";
import { Pencil, Users, ThumbsUp, Laugh, Frown, Angry } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export type GroupMemberStatus = "REQUEST" | "INVITED" | "ACTIVE" | "BLOCKED" | "DELETED";
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
  parentId?: string; // <--- für Antworten!
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

  // Feed regelmäßig neu laden (Polling)
  useEffect(() => {
    let active = true;
    const fetchFeed = async () => {
      const res = await fetch(`/api/groups/${group.id}/feed`);
      if (res.ok) {
        const posts = await res.json();
        if (active) setFeed(posts);
      }
    };
    fetchFeed();
    const interval = setInterval(fetchFeed, 10000); // alle 10 Sekunden
    return () => {
      active = false;
      clearInterval(interval);
    };
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
            {feed
              .filter(post => !post.parentId) // Nur Haupt-Posts!
              .map(post => (
                <PostBlock key={post.id} post={post} group={group} feed={feed} />
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PostBlock({ post, group, feed }: { post: any, group: any, feed: any[] }) {
  const { reactToPost } = useGroups();
  const { data: session } = useSession();
  const [showReplies, setShowReplies] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showReactionLayer, setShowReactionLayer] = useState(false);

  const reactionIcons: Record<string, JSX.Element> = {
    LIKE: <ThumbsUp className="w-4 h-4 inline" />,
    LOL: <Laugh className="w-4 h-4 inline" />,
    SAD: <Frown className="w-4 h-4 inline" />,
    ANGRY: <Angry className="w-4 h-4 inline" />,
  };
  const reactionTypes: ReactionType[] = ["LIKE", "LOL", "SAD", "ANGRY"];

  const memberId = group?.members.find(
    m => String(m.userId) === String(session?.user?.id) && m.status === "ACTIVE"
  )?.id;

  const isAuthor = memberId === post.authorId;

  const handleReaction = async (type: ReactionType) => {
    setErrorMsg(null);
    setShowReactionLayer(false);
    if (!memberId) {
      setErrorMsg("Du bist kein aktives Gruppenmitglied und kannst nicht reagieren.");
      return;
    }
    if (isAuthor) {
      setErrorMsg("Du kannst nicht auf deinen eigenen Beitrag reagieren.");
      return;
    }
    await reactToPost(post.groupId, post.id, memberId, type);
  };

  const replies = feed.filter(p => p.parentId === post.id);
  const latestReply = replies.length > 0 ? replies[replies.length - 1] : null;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setReplyLoading(true);
    await fetch(`/api/groups/${group.id}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: replyContent,
        authorId: memberId,
        parentId: post.id,
      }),
    });
    setReplyContent("");
    setReplyLoading(false);
    setShowReplyForm(false);
  };

  // Ist das eine Antwort?
  const isReply = !!post.parentId;

  return (
    <li
      className={`rounded-xl shadow p-4 flex gap-4 ${
        isReply ? "bg-gray-100" : "bg-white"
      }`}
    >
      <div className="flex-1">
        <div className="font-semibold text-gray-900">
          {post.author?.user?.firstName} {post.author?.user?.lastName}
        </div>
        <div className="text-gray-700 mt-1">{post.content}</div>
        {/* Vergebene Reaktionen als Icons mit Zähler */}
        <div className="flex gap-2 mt-2">
          {reactionTypes.map(type => {
            const count = post.reactions?.filter((r: any) => r.type === type).length || 0;
            return count > 0 ? (
              <span key={type} className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-xs font-semibold">
                {React.cloneElement(reactionIcons[type], { className: "w-4 h-4 inline text-[#e60000]" })}
                {count}
              </span>
            ) : null;
          })}
        </div>
        <hr className="my-2 border-gray-200" />
        {/* Aktionen: Reaktions-Button (LIKE) + Antwort schreiben + Antworten-Link rechts */}
        <div className="flex items-center gap-2 mt-2">
          {/* Nur für Mitglieder außer Autor */}
          {memberId && !isAuthor && (
            <div className="relative">
              {/* Nur LIKE-Icon sichtbar */}
              <button
                className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-[#e60000] hover:text-white font-semibold flex items-center gap-1"
                onClick={() => setShowReactionLayer((prev) => !prev)}
                title="Reagieren"
              >
                {reactionIcons.LIKE}
              </button>
              {/* Layer mit allen Reaktions-Icons */}
              {showReactionLayer && (
                <div className="absolute z-10 left-0 mt-2 bg-white border rounded shadow flex gap-2 p-2">
                  {reactionTypes.map(type => (
                    <button
                      key={type}
                      className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-[#e60000] hover:text-white font-semibold flex items-center gap-1"
                      onClick={() => handleReaction(type)}
                      title={`Mit ${type} reagieren`}
                    >
                      {reactionIcons[type]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Icon für "Antwort schreiben" */}
          {memberId && (
            <button
              className="text-gray-600 hover:text-[#e60000] p-1 rounded"
              title="Antwort schreiben"
              onClick={() => setShowReplyForm((prev) => !prev)}
            >
              <Pencil className="w-5 h-5" />
            </button>
          )}
          {/* Antworten-Link nur wenn Antworten existieren, rechts */}
          {replies.length > 0 && (
            <button
              className="text-blue-600 hover:underline text-xs ml-auto flex items-center gap-1"
              onClick={() => {
                setShowReplies(prev => {
                  if (prev) setShowAllReplies(false);
                  return !prev;
                });
              }}
              style={{ minWidth: "80px" }}
            >
              Antworten
              <span className="ml-1 px-2 py-0.5 rounded bg-gray-200 text-[#e60000] font-bold text-xs">
                {replies.length}
              </span>
            </button>
          )}
        </div>
        {/* Fehlermeldung als Text */}
        {!memberId && (
          <div className="text-red-500 text-xs mt-2">
            Du bist kein aktives Gruppenmitglied und kannst nicht reagieren.
          </div>
        )}
        {errorMsg && (
          <div className="text-red-500 text-xs mt-2">{errorMsg}</div>
        )}
        {/* Antwort-Formular */}
        {showReplyForm && memberId && (
          <form onSubmit={handleReply} className="mt-2 flex gap-2">
            <input
              type="text"
              className="border rounded p-2 flex-1 text-xs"
              placeholder="Antwort verfassen..."
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              disabled={replyLoading}
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#e60000] text-white rounded text-xs font-semibold hover:bg-red-700"
              disabled={replyLoading || !replyContent.trim()}
            >
              Senden
            </button>
          </form>
        )}
        {/* Antworten-Block */}
        {showReplies && (
          <div className="mt-4 p-4 bg-gray-50 rounded shadow">
            {/* Neueste Antwort */}
            {latestReply && !showAllReplies && (
              <PostBlock post={latestReply} group={group} feed={feed} />
            )}
            {/* Link "Alle Antworten" falls mehrere vorhanden */}
            {replies.length > 1 && !showAllReplies && (
              <button
                className="text-blue-600 hover:underline text-xs mt-2"
                onClick={() => setShowAllReplies(true)}
              >
                Alle Antworten anzeigen
              </button>
            )}
            {/* Alle Antworten */}
            {showAllReplies && (
              <div className="space-y-4">
                {replies.map(reply => (
                  <PostBlock key={reply.id} post={reply} group={group} feed={feed} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

import { useGroups } from "./GroupContext";

function GroupListItem({ group, setActiveGroup }: { group: any, setActiveGroup?: (group: any) => void }) {
  const DESCRIPTION_MAX_LENGTH = 120;
  const [open, setOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const { data: session } = useSession();
  const { refreshGroups } = useGroups();

  const shortText = group.description?.slice(0, DESCRIPTION_MAX_LENGTH);

  // Prüfen, ob User bereits Mitglied oder Anfrage gestellt hat
  const isMemberOrRequested = group.members.some(
    m =>
      m.userId === session?.user?.id &&
      (m.status === "ACTIVE" || m.status === "REQUEST")
  );

  // Anfrage senden
  const handleRequest = async () => {
    await fetch(`/api/groups/${group.id}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session?.user?.id }),
    });
    setRequestSent(true);
    refreshGroups();
  };

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
        {/* Beitritts-Button */}
        {!isMemberOrRequested && (
          <div className="mt-2">
            <button
              className="px-3 py-1 bg-[#e60000] text-white rounded text-xs font-semibold hover:bg-red-700"
              onClick={handleRequest}
              disabled={requestSent}
            >
              {requestSent ? "Anfrage gesendet" : "Beitreten"}
            </button>
          </div>
        )}
      </div>
    </li>
  );
}