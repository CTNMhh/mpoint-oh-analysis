import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }
    const cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: {
        items: { // NEU: CartItem-Relation
          include: { event: true }
        }
      }
    });
    return NextResponse.json({
      cart,
      count: cart.items.length
    }, { status: 200 });
  } catch (error) {
    console.error("Fehler in /api/cart:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}