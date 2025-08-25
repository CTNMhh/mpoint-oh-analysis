import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// Pfad ggf. anpassen, falls authOptions woanders liegt
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "5", 10), 100);
  const cursor = searchParams.get("cursor"); // optional für Pagination

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      url: true,
      isRead: true,
      createdAt: true,
    },
  });

  const hasMore = notifications.length > limit;
  const items = hasMore ? notifications.slice(0, -1) : notifications;
  const nextCursor = hasMore ? notifications[notifications.length - 1].id : null;

  return NextResponse.json({ items, nextCursor });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ids: string[] | undefined = body?.ids;
  const all: boolean | undefined = body?.all;

  if (!all && (!ids || !ids.length)) {
    return NextResponse.json({ error: "ids or all required" }, { status: 400 });
  }

  await prisma.notification.updateMany({
    where: all ? { userId, isRead: false } : { userId, id: { in: ids! } },
    data: { isRead: true },
  });

  const unread = await prisma.notification.count({ where: { userId, isRead: false } });
  return NextResponse.json({ ok: true, unread });
}