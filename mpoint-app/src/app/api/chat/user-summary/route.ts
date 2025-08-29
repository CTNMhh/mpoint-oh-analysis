import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "missing userId" }, { status: 400 });

  const u: any = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) return NextResponse.json({ error: "not found" }, { status: 404 });

  const displayName =
    u.displayName ||
    (u.firstName && u.lastName && `${u.firstName} ${u.lastName}`) ||
    u.firstName ||
    u.lastName ||
    u.username ||
    (typeof u.email === "string" ? u.email.split("@")[0] : "") ||
    u.id;

  return NextResponse.json({ id: u.id, displayName });
}