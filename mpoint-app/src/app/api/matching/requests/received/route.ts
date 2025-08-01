import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, MatchStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const matches = await prisma.match.findMany({
    where: {
      receiverUserId: userId,
      status: {
        in: [
          MatchStatus.PENDING,
          MatchStatus.ACCEPTED_BY_RECEIVER,
          MatchStatus.ACCEPTED_BY_SENDER
        ]
      }
    },
    include: {
      senderCompany: true,
    }
  });

  return NextResponse.json(matches);
}