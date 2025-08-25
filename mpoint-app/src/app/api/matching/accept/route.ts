import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, MatchStatus } from "@prisma/client";
import { createNotification } from "../../../../lib/notifications";
import { NotificationType } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { matchId, userId } = await request.json();

  if (!matchId || !userId) {
    return NextResponse.json({ error: "matchId und userId erforderlich" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return NextResponse.json({ error: "Match nicht gefunden" }, { status: 404 });

  let newStatus: MatchStatus | null = null;

  if (userId === match.senderUserId) {
    if (match.status === MatchStatus.PENDING) newStatus = MatchStatus.ACCEPTED_BY_SENDER;
    if (match.status === MatchStatus.ACCEPTED_BY_RECEIVER) newStatus = MatchStatus.CONNECTED;
  } else if (userId === match.receiverUserId) {
    if (match.status === MatchStatus.PENDING) newStatus = MatchStatus.ACCEPTED_BY_RECEIVER;
    if (match.status === MatchStatus.ACCEPTED_BY_SENDER) newStatus = MatchStatus.CONNECTED;
  }

  if (!newStatus) return NextResponse.json({ error: "Ungültige Aktion" }, { status: 400 });

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: { status: newStatus, respondedAt: new Date() },
  });

  // Notification nach erfolgreichem Update
  try {
    // Hole die User-Daten für den Namen
    const sender = await prisma.user.findUnique({ where: { id: match.senderUserId } });
    const receiver = await prisma.user.findUnique({ where: { id: match.receiverUserId } });
    const accepter =
      userId === match.senderUserId ? sender : receiver;
    const accepterDisplayName =
      [accepter?.firstName, accepter?.lastName].filter(Boolean).join(" ") ||
      accepter?.name ||
      accepter?.email ||
      "Ihr Kontakt";

    // Benachrichtige die andere Partei
    const notifyUserId =
      userId === match.senderUserId ? match.receiverUserId : match.senderUserId;

    let title = "";
    let body = "";

    if (userId === match.receiverUserId) {
      // Receiver akzeptiert: Sender bekommt Notification
      title = "Ihre Match-Anfrage wurde angenommen";
      body = `${accepterDisplayName} hat Ihre Match-Anfrage angenommen.`;
    } else if (userId === match.senderUserId) {
      // Sender akzeptiert: Receiver bekommt Notification
      title = "Neue Match-Anfrage";
      body = `${accepterDisplayName} möchte sich mit Ihnen vernetzen.`;
    }

    await createNotification({
      userId: notifyUserId,
      type: NotificationType.MATCH_ACCEPTED,
      title,
      body,
      url: `/Matches/search`
    });
  } catch (e) {
    // Fehler ignorieren, damit die Funktion nicht gestört wird
    console.error("Notification error:", e);
  }

  return NextResponse.json({ success: true, match: updated });
}

export async function DELETE(request: NextRequest) {
  const { matchId } = await request.json();
  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });
  await prisma.match.delete({ where: { id: matchId } });
  return NextResponse.json({ success: true });
}