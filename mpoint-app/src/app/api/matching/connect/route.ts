import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, MatchStatus, MatchType } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { userId, companyId, partnerCompanyId, receiverUserId } = await request.json();

  // Hole die Company-IDs aus dem User-Kontext oder übergebe sie im Body!
  if (!userId || !companyId || !partnerCompanyId || !receiverUserId) {
    return NextResponse.json(
      { error: "userId, companyId, partnerCompanyId und receiverUserId erforderlich" },
      { status: 400 }
    );
  }

  // Lege neuen Match an
  const match = await prisma.match.create({
    data: {
      status: MatchStatus.PENDING,
      matchScore: 0, // or another default value
      matchType: MatchType.NETWORKING, // use a valid MatchType enum value
      matchReasons: [], // or a default array of reasons
      commonInterests: [], // or a default array of interests
      potentialSynergies: [], // add a default value for required field
      senderUser: { connect: { id: userId } },
      senderCompany: { connect: { id: companyId } },
      receiverCompany: { connect: { id: partnerCompanyId } },
      receiverUser: { connect: { id: receiverUserId } },
      // Add other required fields with default or appropriate values
    },
  });

  return NextResponse.json({ matchId: match.id });
}