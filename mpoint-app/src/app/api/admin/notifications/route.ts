import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAdmin } from "../utils/verifyAdmin";

const prisma = new PrismaClient();
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/notifications?limit=20&userId=<optional>
export async function GET(req: NextRequest) {
  const admin = verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const userId = searchParams.get("userId") || undefined;

  const items = await prisma.notification.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  });

  return NextResponse.json({ items });
}

// PATCH /api/admin/notifications
// Body: { ids?: string[]; all?: boolean; userId?: string; markRead?: boolean }
export async function PATCH(req: NextRequest) {
  const admin = verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { ids, all, userId, markRead = true } = body;

  if (!all && (!ids || !Array.isArray(ids) || ids.length === 0)) {
    return NextResponse.json({ error: "ids oder all erforderlich" }, { status: 400 });
  }

  const where = all
    ? { ...(userId ? { userId } : {}), isRead: !markRead }
    : { id: { in: ids } };

  const result = await prisma.notification.updateMany({
    where,
    data: { isRead: markRead }
  });

  return NextResponse.json({ updated: result.count });
}