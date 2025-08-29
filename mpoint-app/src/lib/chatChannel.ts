import { PrismaClient, MatchStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma"; // Falls du bereits einen zentralen Prisma-Client hast

// Aktive Match-Status (an deine ENUMs angepasst)
const ACTIVE_MATCH_STATUSES: MatchStatus[] = [
  MatchStatus.CONNECTED,
  MatchStatus.ACCEPTED,
  MatchStatus.ACCEPTED_BY_SENDER,
  MatchStatus.ACCEPTED_BY_RECEIVER
];

export type ChatChannel =
  | { type: "match"; matchId: string }
  | { type: "direct"; senderUserId: string; receiverUserId: string };

export async function resolveChatChannel(userA: string, userB: string): Promise<ChatChannel> {
  if (userA === userB) {
    throw new Error("Self-Chat nicht erlaubt");
  }

  // 1. Prüfe ob aktives Match existiert (egal wer Sender war)
  const match = await prisma.match.findFirst({
    where: {
      OR: [
        { senderUserId: userA, receiverUserId: userB },
        { senderUserId: userB, receiverUserId: userA }
      ],
      status: { in: ACTIVE_MATCH_STATUSES }
    },
    select: { id: true }
  });

  if (match) {
    return { type: "match", matchId: match.id };
  }

  // 2. Kein aktives Match -> direkter Kanal (wir speichern nur Nutzerpaar in Message später)
  // (Kein eigenes Conversation-Model nötig – Identifikation erfolgt über (senderUserId, receiverUserId) in beiden Richtungen)
  return {
    type: "direct",
    senderUserId: userA,
    receiverUserId: userB
  };
}

/**
 * Liefert normierte Paar-Keys (für SSE / Subscription).
 * Bei Match: match:<matchId>
 * Bei Direct: direct:<sortedUserA>:<sortedUserB>
 */
export function channelKey(channel: ChatChannel): string {
  if (channel.type === "match") return `match:${channel.matchId}`;
  const a = channel.senderUserId;
  const b = channel.receiverUserId;
  // Sortierung für Richtungslosigkeit
  const [x, y] = [a, b].sort();
  return `direct:${x}:${y}`;
}