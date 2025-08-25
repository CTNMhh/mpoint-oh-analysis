import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        titel: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Fehler beim Abrufen der Benutzerdaten:", error);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
