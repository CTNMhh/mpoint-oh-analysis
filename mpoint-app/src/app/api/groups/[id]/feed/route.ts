import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { content, authorId, parentId } = await req.json();

  // Neuen Post oder Antwort anlegen
  const post = await prisma.groupFeedPost.create({
    data: {
      groupId: params.id,
      authorId,
      content,
      parentId, // <-- Antwort auf einen Post
    },
  });

  return NextResponse.json(post, { status: 201 });
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
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
                //avatarUrl: true, // <--- Avatar mitladen! Für später
              },
            },
          },
        },
        reactions: true,
      },
    });
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Interner Serverfehler", details: String(error) }, { status: 500 });
  }
}