import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient, MatchStatus } from "@prisma/client";

const prisma = new PrismaClient();
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matchId = req.nextUrl.searchParams.get("matchId") || "";
  const companyIdParam = req.nextUrl.searchParams.get("companyId") || "";
  const userIdParam = req.nextUrl.searchParams.get("userId") || "";

  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });

  // companyId NICHT aus Session holen
  let myCompanyId = companyIdParam;
  if (!myCompanyId && userIdParam) {
    const comp = await prisma.company.findFirst({ where: { userId: userIdParam }, select: { id: true } });
    myCompanyId = comp?.id || "";
  }
  if (!myCompanyId) return NextResponse.json({ error: "companyId or userId required" }, { status: 400 });

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { senderCompany: true, receiverCompany: true }
  });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const isParticipant = [match.senderCompanyId, match.receiverCompanyId].includes(myCompanyId);
  if (!isParticipant || match.status !== MatchStatus.CONNECTED)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const partnerCompany =
    match.senderCompanyId === myCompanyId ? match.receiverCompany : match.senderCompany;

  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: "asc" },
    take: 200
  });

  return NextResponse.json({
    messages,
    partner: partnerCompany ? { id: partnerCompany.id, name: partnerCompany.name } : null
  });
}