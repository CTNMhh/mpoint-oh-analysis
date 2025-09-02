import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { createNotification } from "@/lib/notifications";
import { NotificationType } from "@prisma/client"; // <--- Enum importieren

export async function POST(req: NextRequest) {
  const { userId, groupId } = await req.json();
  if (!userId || !groupId) {
    return NextResponse.json({ error: "Missing userId or groupId" }, { status: 400 });
  }
  try {
    await createNotification({
      userId,
      type: NotificationType.GROUP_INVITE, // <--- Enum verwenden
      title: "Gruppeneinladung erneut gesendet",
      body: "Du wurdest erneut zur Gruppe eingeladen.",
      url: `/gruppen/${groupId}`,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Fehler beim Senden der Einladung" }, { status: 500 });
  }
}