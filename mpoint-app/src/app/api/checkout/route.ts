import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { createPayPalOrder } from "@/lib/paypalClient";
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"]
});

export async function POST(request: NextRequest) {
  try {
    console.log("Start Checkout"); // Sollte immer erscheinen!
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }
    const { paymentMethod, address } = await request.json();

    // Cart und CartItems laden
    const cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: { items: { include: { event: true } } }
    });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Warenkorb ist leer" }, { status: 400 });
    }

    // Buchungen anlegen
    const bookings = await Promise.all(cart.items.map(item =>
      prisma.booking.create({
        data: {
          userId: session.user.id,
          eventId: item.eventId,
          spaces: item.spaces,
          bookingStatus: "PENDING",
          name: address.name,
          email: address.email,
          paymentMethod: paymentMethod, // <--- Hier ergänzen!
          pricePerSpace: item.event.price,
          totalAmount: item.event.price * item.spaces,
          currency: "EUR"
        }
      })
    ));
    console.log("Bookings:", bookings);

    // Transaktion anlegen
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.event.price * item.spaces), 0);
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount: totalAmount,
        currency: "EUR",
        paymentMethod,
        paymentStatus: "PENDING",
        bookings: { connect: bookings.map(b => ({ id: b.id })) }
      }
    });
    console.log("Transaction-Data:", {
      userId: session.user.id,
      amount: totalAmount,
      currency: "EUR",
      paymentMethod,
      paymentStatus: "PENDING",
      bookings: { connect: bookings.map(b => ({ id: b.id })) }
    });

    // Buchungen mit Transaktion verknüpfen
    await Promise.all(bookings.map(b =>
      prisma.booking.update({
        where: { id: b.id },
        data: { transactionId: transaction.id }
      })
    ));

    // Warenkorb leeren
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // PayPal-Zahlung initiieren
    if (paymentMethod === "PAYPAL") {
      const paypalOrder = await createPayPalOrder(totalAmount, "EUR");
      // Speichere die PayPal-Order-ID in Transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          externalTransactionId: paypalOrder.id,
          paymentStatus: "PENDING"
        }
      });
      // Gib die PayPal-Order-ID an das Frontend zurück, damit der User bezahlen kann
      return NextResponse.json({ paypalOrderId: paypalOrder.id });
    }

    return NextResponse.json({ success: true, transactionId: transaction.id });
  } catch (error) {
    console.error("Fehler im Checkout:", error);
    return NextResponse.json({ error: "Interner Serverfehler" + error }, { status: 500 });
  }
}

export async function GET() {
  console.log("GET /api/checkout");
  return NextResponse.json({ ok: true });
}