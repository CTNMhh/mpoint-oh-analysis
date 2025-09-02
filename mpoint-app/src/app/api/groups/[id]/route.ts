import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ENTERPRISE") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });
  }

  const groupId = params.id;
  const { name, description, avatarUrl, invitedUserIds } = await req.json();

  try {
    // Gruppe aktualisieren inkl. Avatar
    await prisma.group.update({
      where: { id: groupId },
      data: { name, description, avatarUrl },
    });

    // User einladen (nur neue Einladungen)
    if (Array.isArray(invitedUserIds) && invitedUserIds.length > 0) {
      for (const userId of invitedUserIds) {
        const exists = await prisma.groupMember.findFirst({
          where: { groupId, userId },
        });
        if (!exists) {
          await prisma.groupMember.create({
            data: {
              groupId,
              userId,
              status: "INVITED",
              invitedById: session.user.id,
            },
          });
          await prisma.notification.create({
            data: {
              userId,
              type: "GROUP_INVITE",
              title: `Einladung zur Gruppe`,
              body: `Du wurdest zur Gruppe eingeladen.`,
              url: `/gruppen/${groupId}`,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Fehler beim Bearbeiten der Gruppe:", err);
    return NextResponse.json({ error: "Fehler beim Bearbeiten der Gruppe", details: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        feedPosts: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            reactions: true,
          },
        },
        members: true,
        // weitere Relationen nach Bedarf
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Gruppe nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json(group, { status: 200 });
  } catch (err) {
    console.error("Fehler beim Laden der Gruppe:", err);
    return NextResponse.json({ error: "Fehler beim Laden der Gruppe", details: String(err) }, { status: 500 });
  }
}