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
  const { eventId, spaces } = await request.json();
  let cart = await prisma.cart.findFirst({ where: { userId: session.user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: session.user.id } });
  }
  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, eventId },
  });
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { spaces: existing.spaces + spaces },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, eventId, spaces },
    });
  }
  return NextResponse.json({ success: true });
}