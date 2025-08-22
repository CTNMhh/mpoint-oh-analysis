import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, userId, name, email, spaces = 1, comment } = body;

    // Event laden für Preis
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ error: "Event nicht gefunden" }, { status: 404 });
    }

    // Preis berechnen
    const pricePerSpace = event.chargeFree ? 0 : event.price;
    const totalAmount = pricePerSpace * spaces;

    // Booking mit Preis-Snapshot erstellen
    const booking = await prisma.booking.create({
      data: {
        eventId,
        name,
        email,
        spaces,
        comment: comment || "",
        userId: userId || null,

        // NEU: Preis-Informationen speichern
        pricePerSpace,
        totalAmount,
        currency: "EUR",
        paymentStatus: event.chargeFree ? "NOT_REQUIRED" : "PENDING"
      },
    });

    // Event bookedCount erhöhen
    await prisma.event.update({
      where: { id: eventId },
      data: { bookedCount: { increment: spaces } },
    });

    // Wenn kostenpflichtig, Payment-Flow initiieren
    if (!event.chargeFree && totalAmount > 0) {
      // TODO: Stripe/PayPal Payment Intent erstellen
      // const paymentIntent = await createPaymentIntent(booking, totalAmount);
      // return NextResponse.json({ booking, paymentUrl: paymentIntent.url });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Buchung fehlgeschlagen" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId fehlt" }, { status: 400 });
  }

  try {
    const where: any = { userId };
    if (eventId) {
      where.eventId = eventId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: { event: true }
    });
    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Laden der Buchungen" }, { status: 500 });
  }
}