import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }
  const { bookingId } = await request.json();
  await prisma.booking.update({
    where: { id: bookingId },
    data: { cartId: null }
  });
  return NextResponse.json({ success: true });
}