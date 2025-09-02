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

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  try {
    if (query && query.trim().length >= 2) {
      // Suche nach Name, Vorname oder E-Mail (case-insensitive)
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
        },
        take: 10,
      });

      return NextResponse.json(users);
    }

    // Wenn kein Query: eigenen User zurückgeben (wie bisher)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        username: true,
        email: true,
        anrede: true,
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
    console.error("Fehler bei der User-Suche:", error);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}