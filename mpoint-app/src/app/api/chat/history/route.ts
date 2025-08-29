import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { resolveChatChannel } from "@/lib/chatChannel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.user?.id;
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const peerUserId = req.nextUrl.searchParams.get("peerUserId");
  if (!peerUserId) return NextResponse.json({ error: "peerUserId required" }, { status: 400 });
  if (peerUserId === me) return NextResponse.json({ error: "self not allowed" }, { status: 400 });

  const channel = await resolveChatChannel(me, peerUserId);

  let messages;
  if (channel.type === "match") {
    messages = await prisma.message.findMany({
      where: { matchId: channel.matchId },
      orderBy: { createdAt: "asc" },
      take: 300
    });
  } else {
    // Direkt: beide Richtungen ohne matchId
    messages = await prisma.message.findMany({
      where: {
        matchId: null,
        OR: [
          { senderUserId: me, receiverUserId: peerUserId },
          { senderUserId: peerUserId, receiverUserId: me }
        ]
      },
      orderBy: { createdAt: "asc" },
      take: 300
    });
  }

  return NextResponse.json({ channel, messages });
}