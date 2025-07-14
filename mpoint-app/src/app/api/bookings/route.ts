import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, name, email, spaces, comment, userId } = body;

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