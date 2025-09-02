import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { resolveChatChannel, channelKey } from "@/lib/chatChannel";
import { publish } from "../../../../lib/sse";
import { NotificationType } from "@prisma/client";
import { createNotification } from "../../../../lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    const me = (session as any)?.user?.id;
    if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const peerUserId = body?.peerUserId;
    const content = body?.content?.trim();

    if (!peerUserId || !content) {
      return NextResponse.json({ error: "peerUserId & content required" }, { status: 400 });
    }
    if (peerUserId === me) {
      return NextResponse.json({ error: "self not allowed" }, { status: 400 });
    }

    const channel = await resolveChatChannel(me, peerUserId);

    let message;
    let senderDisplayName = "Unbekannt";

    if (channel.type === "match") {
      const match = await prisma.match.findUnique({
        where: { id: channel.matchId },
        select: {
          id: true,
          senderUserId: true,
          receiverUserId: true,
          senderCompanyId: true,
          receiverCompanyId: true
        }
      });
      if (!match) return NextResponse.json({ error: "match not found" }, { status: 404 });

      const senderIsSenderSide = match.senderUserId === me;

      // Firmenname des sendenden Unternehmens laden
      const senderCompanyIdForName = senderIsSenderSide ? match.senderCompanyId : match.receiverCompanyId;
      const senderCompanyRecord = await prisma.company.findUnique({
        where: { id: senderCompanyIdForName },
        select: { name: true }
      });
      if (senderCompanyRecord?.name) senderDisplayName = senderCompanyRecord.name;

      message = await prisma.message.create({
        data: {
          matchId: match.id,
          senderUserId: me,
          senderCompanyId: senderIsSenderSide ? match.senderCompanyId : match.receiverCompanyId,
          receiverUserId: peerUserId,
          receiverCompanyId: senderIsSenderSide ? match.receiverCompanyId : match.senderCompanyId,
          content
        }
      });
    } else {
      // Direct Chat
      const [senderCompany, receiverCompany] = await Promise.all([
        prisma.company.findFirst({ where: { userId: me }, select: { id: true, name: true } }),
        prisma.company.findFirst({ where: { userId: peerUserId }, select: { id: true, name: true } })
      ]);

      // Fallback IDs falls keine Company existiert
      const senderCompanyId = senderCompany?.id || `DIRECT_NO_COMPANY_${me}`;
      const receiverCompanyId = receiverCompany?.id || `DIRECT_NO_COMPANY_${peerUserId}`;

      // Anzeigename: Firmenname falls vorhanden, sonst gekürzte User-ID
      senderDisplayName = senderCompany?.name || (`User ${me.substring(0, 6)}`);

      message = await prisma.message.create({
        data: {
          matchId: null,
          senderUserId: me,
          senderCompanyId,
          receiverUserId: peerUserId,
          receiverCompanyId,
          content
        }
      });
    }

    await createNotification({
        userId: message.receiverUserId,
        type: NotificationType.MESSAGE,
        title: "Neue Nachricht",
        body: `${senderDisplayName}: ${message.content?.slice(0, 120) || ""}`,
        url: `/chat/${message.senderUserId}`, // Direkt auf den Chat mit dem Sender
      });

    publish(channelKey(channel), { type: "message", message });
    return NextResponse.json({ message });
  } catch (e: any) {
    console.error("CHAT_SEND_ERROR:", {
      message: e?.message,
      stack: e?.stack,
      meta: e
    });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}