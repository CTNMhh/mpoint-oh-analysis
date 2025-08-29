import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { userId, groupId } = await req.json();
  if (!userId || !groupId) {
    return NextResponse.json({ error: "Missing userId or groupId" }, { status: 400 });
  }
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: "GROUP_INVITE",
        title: "Gruppeneinladung erneut gesendet",
        body: "Du wurdest erneut zur Gruppe eingeladen.",
        url: `/gruppen/${groupId}`,
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Fehler beim Senden der Einladung" }, { status: 500 });
  }
}