import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  // Alle Buchungen des Users inkl. Event-Daten
  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { event: true }
  });

  return NextResponse.json(bookings);
}