import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  try {
    const invitations = await prisma.groupMember.findMany({
      where: {
        userId: session.user.id,
        status: "INVITED",
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            avatarUrl: true, // <--- Avatar mit abfragen!
          },
        },
        invitedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json(invitations, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Fehler beim Laden der Einladungen" }, { status: 500 });
  }
}