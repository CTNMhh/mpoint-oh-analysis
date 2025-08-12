// mpoint\mpoint-app\src\app\api\bookings\[id]\route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  // Buchung laden
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { event: true }
  });

  if (!booking) {
    return NextResponse.json({ error: "Buchung nicht gefunden" }, { status: 404 });
  }

  // Nur eigene Buchung löschen
  if (booking.userId !== session.user.id) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  // Wenn Event bezahlt ist, hier Rückerstattung auslösen (z.B. Stripe/PayPal)
  if (booking.event.price > 0) {
    // TODO: Rückerstattung ausführen (z.B. Stripe API)
    // await refundPayment(booking.paymentId);
  }

  // Buchung löschen
  await prisma.booking.delete({ where: { id: params.id } });

  // Teilnehmerzahl im Event verringern
  await prisma.event.update({
    where: { id: booking.eventId },
    data: { bookedCount: { decrement: booking.spaces } }
  });

  return NextResponse.json({ success: true });
}