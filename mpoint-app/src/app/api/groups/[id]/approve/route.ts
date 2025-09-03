import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { NotificationType } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { memberId } = await req.json();

    // Status auf ACTIVE setzen
    const updated = await prisma.groupMember.update({
      where: { id: memberId },
      include: { user: true, group: true },
      data: { status: "ACTIVE" },
    });

    // Notification an den User
    await createNotification({
      userId: updated.userId,
      type: NotificationType.GROUP_APPROVED,
      title: "Beitritt bestätigt",
      body: `Du bist jetzt Mitglied der Gruppe "${updated.group.name}".`,
      url: `/gruppen/${updated.groupId}`,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Fehler in /api/groups/[id]/approve:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}