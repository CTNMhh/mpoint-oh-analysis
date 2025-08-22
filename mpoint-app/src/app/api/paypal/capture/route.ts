import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypalClient";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { orderId } = await request.json();
  const captureData = await capturePayPalOrder(orderId);

  if (captureData.status === "COMPLETED") {
    // Transaction suchen
    const transaction = await prisma.transaction.findUnique({
      where: { externalTransactionId: orderId }
    });
    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction nicht gefunden." }, { status: 404 });
    }

    // Transaction aktualisieren
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        paymentStatus: "PAID", // oder "COMPLETED" je nach Enum
        paypalResponse: captureData
      }
    });

    // Alle zugehörigen Buchungen aktualisieren
    await prisma.booking.updateMany({
      where: { transactionId: transaction.id },
      data: {
        paymentStatus: "PAID", // oder "COMPLETED"
        bookingStatus: "COMPLETED"
      }
    });

    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, error: "PayPal-Zahlung fehlgeschlagen.", paypalResponse: captureData });
  }
}