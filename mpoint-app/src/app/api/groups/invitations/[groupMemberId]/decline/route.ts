import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { groupMemberId: string } }) {
  try {
    await prisma.groupMember.delete({
      where: { id: params.groupMemberId },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Fehler beim Ablehnen der Einladung" }, { status: 500 });
  }
}