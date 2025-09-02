import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { groupMemberId: string } }) {
  try {
    await prisma.groupMember.update({
      where: { id: params.groupMemberId },
      data: { status: "ACTIVE", joinedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Fehler beim Annehmen der Einladung" }, { status: 500 });
  }
}