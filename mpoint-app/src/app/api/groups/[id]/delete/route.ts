import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { memberId } = await req.json();

  // Lösche den GroupMember-Eintrag
  await prisma.groupMember.delete({
    where: { id: memberId },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}