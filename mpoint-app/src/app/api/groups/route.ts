import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ENTERPRISE") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });
    }

    const data = await req.json();
    const { name, description, avatarUrl } = data;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Gruppenname erforderlich" }, { status: 400 });
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        avatarUrl,
        adminId: session.user.id,
        members: {
          create: [
            {
              userId: session.user.id,
              status: "ACTIVE",
              joinedAt: new Date(),
            },
          ],
        },
      },
      include: { members: true },
    });
    return NextResponse.json(group, { status: 201 });
  } catch (err) {
    console.error("Fehler beim Erstellen der Gruppe:", err);
    return NextResponse.json({ error: "Fehler beim Erstellen der Gruppe", details: String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json([], { status: 200 });
    }

    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { adminId: session.user.id },
          { members: { some: { userId: session.user.id, status: "ACTIVE" } } },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        feedPosts: true,
      },
    });

    return NextResponse.json(groups, { status: 200 });
  } catch (err) {
    console.error("Fehler beim Laden der Gruppen:", err);
    return NextResponse.json({ error: "Fehler beim Laden der Gruppen", details: String(err) }, { status: 500 });
  }
}