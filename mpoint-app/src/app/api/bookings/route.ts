import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, userId } = body;

    // Prüfen, ob schon eine Buchung existiert
    const existing = await prisma.booking.findFirst({
      where: { eventId, userId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Du bist für dieses Event bereits angemeldet." },
        { status: 400 }
      );
    }

    const { name, email, spaces, comment } = body;

    if (!eventId || !name || !email) {
      return NextResponse.json({ error: "Fehlende Felder" }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        eventId,
        name,
        email,
        spaces: spaces || 1,
        comment: comment || "",
        userId: userId || null,
      },
    });

    // Optional: Teilnehmerzahl im Event erhöhen
    await prisma.event.update({
      where: { id: eventId },
      data: { bookedCount: { increment: spaces || 1 } },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Buchung fehlgeschlagen" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ error: "eventId fehlt" }, { status: 400 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Laden der Buchungen" }, { status: 500 });
  }
}