import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    const groupId = params.id;
    const postId = params.postId;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });
    }
    const { memberId, type } = await req.json();
    if (!memberId || !type) {
      return NextResponse.json({ error: "memberId und type erforderlich" }, { status: 400 });
    }

    // Regel 3: Verfasser darf nicht reagieren
    const post = await prisma.groupFeedPost.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (post?.authorId === memberId) {
      return NextResponse.json({ error: "Verfasser darf nicht reagieren" }, { status: 403 });
    }

    // Regel 1 & 2: Nur eine Reaktion pro Mitglied/Post, Reaktion kann geändert werden
    const reaction = await prisma.groupFeedReaction.upsert({
      where: {
        postId_memberId: {
          postId,
          memberId,
        },
      },
      update: { type },
      create: {
        postId,
        memberId,
        type,
      },
    });

    return NextResponse.json(reaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Interner Serverfehler", details: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}