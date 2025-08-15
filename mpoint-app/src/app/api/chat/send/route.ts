import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient, MatchStatus } from "@prisma/client";
import { publish } from "../../../../lib/sse";

const prisma = new PrismaClient();
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const matchId = String(body.matchId ?? "");
    const content = String(body.content ?? "").trim();
    const myCompanyId = String(body.companyId ?? "");
    const senderUserId = String(body.senderUserId ?? "");

    if (!matchId || !content) return NextResponse.json({ error: "matchId and content required" }, { status: 400 });
    if (!myCompanyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });
    if (!senderUserId) return NextResponse.json({ error: "senderUserId required" }, { status: 400 });

    // Match inkl. User auf beiden Seiten laden
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        senderCompany: { include: { user: true } },
        receiverCompany: { include: { user: true } },
      },
    });
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    // Status prüfen (ENUM-safe)
    if (match.status !== MatchStatus.CONNECTED) {
      return NextResponse.json({ error: "Forbidden: not connected" }, { status: 403 });
    }

    const isSenderSide = match.senderCompanyId === myCompanyId;
    const isReceiverSide = match.receiverCompanyId === myCompanyId;
    if (!isSenderSide && !isReceiverSide) {
      return NextResponse.json({ error: "Forbidden: not participant" }, { status: 403 });
    }

    const receiverCompanyId = isSenderSide ? match.receiverCompanyId : match.senderCompanyId;
    const receiverUserId = isSenderSide ? match.receiverCompany?.user?.id : match.senderCompany?.user?.id;
    if (!receiverUserId) {
      return NextResponse.json({ error: "Receiver user missing" }, { status: 422 });
    }

    // Nachricht speichern
    try {
      const message = await prisma.message.create({
        data: {
          matchId,
          content,
          senderUserId,
          senderCompanyId: myCompanyId,
          receiverUserId,
          receiverCompanyId,
        },
      });

      publish(matchId, { type: "message", message });
      return NextResponse.json({ success: true, message });
    } catch (e: any) {
      // Prisma-Fehler sichtbar machen
      console.error("Prisma create message error:", e);
      return NextResponse.json(
        { error: "DB error", detail: e?.message ?? String(e) },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("POST /api/chat/send failed:", err);
    return NextResponse.json({ error: "Internal error", detail: err?.message ?? String(err) }, { status: 500 });
  }
}