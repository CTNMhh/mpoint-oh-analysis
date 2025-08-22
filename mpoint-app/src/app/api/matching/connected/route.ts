import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, MatchStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const matches = await prisma.match.findMany({
    where: {
      status: MatchStatus.CONNECTED,
      OR: [
        { senderUserId: userId },
        { receiverUserId: userId }
      ]
    },
    include: {
      senderCompany: true,
      receiverCompany: true
    }
  });

  return NextResponse.json(matches);
}