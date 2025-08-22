import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, MatchStatus } from "@prisma/client";

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

  return NextResponse.json({ success: true, match: updated });
}

export async function DELETE(request: NextRequest) {
  const { matchId } = await request.json();
  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });
  await prisma.match.delete({ where: { id: matchId } });
  return NextResponse.json({ success: true });
}