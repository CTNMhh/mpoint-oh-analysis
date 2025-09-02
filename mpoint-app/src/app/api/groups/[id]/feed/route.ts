import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;
    console.log("POST /api/groups/[id]/feed erreicht"); // <-- Debug-Ausgabe
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });
    }

    const { content, authorId } = await req.json();
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Post-Inhalt erforderlich" }, { status: 400 });
    }
    if (!authorId || typeof authorId !== "string") {
      return NextResponse.json({ error: "authorId erforderlich" }, { status: 400 });
    }

    const groupMember = await prisma.groupMember.findUnique({
      where: { id: authorId },
      select: { id: true, groupId: true, status: true },
    });
    if (!groupMember || groupMember.groupId !== id || groupMember.status !== "ACTIVE") {
      return NextResponse.json({ error: "Ungültige authorId oder kein aktives Gruppenmitglied" }, { status: 403 });
    }

    // Debug-Ausgabe vor dem Erstellen des Posts
    console.log("authorId:", authorId);
    console.log("groupMember:", groupMember);

    const post = await prisma.groupFeedPost.create({
      data: {
        groupId: id,
        authorId,
        content,
      },
    });

    // Hole die vollständigen Daten des Posts inkl. Autor und User
    const fullPost = await prisma.groupFeedPost.findUnique({
      where: { id: post.id },
      include: {
        author: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        reactions: true,
      },
    });

    return NextResponse.json(fullPost, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Interner Serverfehler", details: String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const posts = await prisma.groupFeedPost.findMany({
    where: { groupId: id },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      reactions: true,
    },
  });
  return NextResponse.json(posts, { status: 200 });
}