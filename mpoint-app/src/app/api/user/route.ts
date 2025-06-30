import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        username: true,
        email: true,
        anrede: true,
        titel: true,
        firstName: true,
        lastName: true,
        // Passwort NICHT zurückgeben aus Sicherheitsgründen
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json({
      username: user.username,
      email: user.email,
      anrede: user.anrede,
      titel: user.titel,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Benutzerdaten:", error);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}