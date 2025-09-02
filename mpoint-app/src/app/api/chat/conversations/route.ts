import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { MatchStatus } from "@prisma/client";

const ACTIVE_MATCH_STATUSES: MatchStatus[] = [
  MatchStatus.CONNECTED,
  MatchStatus.ACCEPTED,
  MatchStatus.ACCEPTED_BY_SENDER,
  MatchStatus.ACCEPTED_BY_RECEIVER,
];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.user?.id;
  if (!me) return NextResponse.json([], { status: 200 });

  // Letzte Nachrichten (Match + Direkt) sammeln
  const msgs = await prisma.message.findMany({
    where: {
      OR: [{ senderUserId: me }, { receiverUserId: me }],
    },
    orderBy: { createdAt: "desc" },
    take: 800, // ausreichend für Liste
    select: {
      id: true,
      matchId: true,
      senderUserId: true,
      receiverUserId: true,
      content: true,
      createdAt: true,
    },
  });

  const map = new Map<
    string,
    {
      peerUserId: string;
      lastAt: Date;
      lastContent: string;
      hasMatch: boolean;
      anyMatchId?: string | null;
    }
  >();

  for (const m of msgs) {
    const peer =
      m.senderUserId === me ? m.receiverUserId : m.senderUserId;
    const existing = map.get(peer);
    if (!existing) {
      map.set(peer, {
        peerUserId: peer,
        lastAt: m.createdAt,
        lastContent: m.content,
        hasMatch: !!m.matchId,
        anyMatchId: m.matchId,
      });
    } else {
      // Update nur wenn diese Nachricht neuer ist
      if (m.createdAt > existing.lastAt) {
        existing.lastAt = m.createdAt;
        existing.lastContent = m.content;
      }
      if (m.matchId) {
        existing.hasMatch = true;
        existing.anyMatchId = m.matchId;
      }
    }
  }

  if (map.size === 0) return NextResponse.json([]);

  const peers = Array.from(map.values());

  // Alle User-Felder holen (kein select -> damit wir flexibel sind)
  const users = await prisma.user.findMany({
    where: { id: { in: peers.map(p => p.peerUserId) } }
  });

  // Hilfsfunktion um einen Anzeigenamen aus möglichen Feldern abzuleiten
  function userDisplayName(u: any): string {
    return (
      u.displayName ||
      (u.firstName && u.lastName && `${u.firstName} ${u.lastName}`) ||
      u.firstName ||
      u.lastName ||
      u.username ||
      (typeof u.email === "string" ? u.email.split("@")[0] : "") ||
      u.id
    );
  }

  // Companies (erste Company)
  const companies = await prisma.company.findMany({
    where: { userId: { in: peers.map(p => p.peerUserId) } },
    select: { id: true, name: true, userId: true },
  });

  // Matches (Status nötig um nur CONNECTED als "match" zu markieren)
  const matches = await prisma.match.findMany({
    where: {
      status: { in: ACTIVE_MATCH_STATUSES },
      OR: [
        { senderUserId: me, receiverUserId: { in: peers.map(p => p.peerUserId) } },
        { receiverUserId: me, senderUserId: { in: peers.map(p => p.peerUserId) } },
      ],
    },
    select: { id: true, senderUserId: true, receiverUserId: true, status: true },
  });

  const out = peers.map(p => {
    const u = users.find(x => x.id === p.peerUserId);
    const c = companies.find(x => x.userId === p.peerUserId);
    const m = matches.find(
      x =>
        (x.senderUserId === me && x.receiverUserId === p.peerUserId) ||
        (x.receiverUserId === me && x.senderUserId === p.peerUserId)
    );
    return {
      peerUserId: p.peerUserId,
      name: c?.name || (u ? userDisplayName(u) : p.peerUserId),
      companyName: c?.name,
      channelType: m && m.status === MatchStatus.CONNECTED ? "match" : "direct",
      lastAt: p.lastAt,
      lastContent: p.lastContent,
      matchId: m?.id || p.anyMatchId || null,
    };
  });

  // Sortiert (falls Reihenfolge im Map nicht ausreicht)
  out.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());

  return NextResponse.json(out);
}