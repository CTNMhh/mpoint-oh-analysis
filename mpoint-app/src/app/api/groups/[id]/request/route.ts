import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { NotificationType } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await req.json();

    // Prüfen, ob schon ein Eintrag existiert
    const existing = await prisma.groupMember.findFirst({
      where: { groupId: params.id, userId }
    });

    if (existing) {
      return NextResponse.json({ error: "Anfrage oder Mitgliedschaft existiert bereits." }, { status: 400 });
    }

    // Anfrage anlegen
    const member = await prisma.groupMember.create({
      data: {
        groupId: params.id,
        userId,
        status: "REQUEST",
      },
      include: {
        user: true,
      }
    });

    // Hole die Gruppe und Admin
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      select: { adminId: true, name: true }
    });

    // Notification für den Admin anlegen
    if (group?.adminId) {
      await createNotification({
        userId: group.adminId,
        type: NotificationType.GROUP_REQUEST,
        title: "Neue Beitrittsanfrage",
        body: `${member.user.firstName} ${member.user.lastName} möchte der Gruppe "${group.name}" beitreten.`,
        url: `/gruppen-verwalten?tab=requests`
      });
    }

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Fehler in /api/groups/[id]/request:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}