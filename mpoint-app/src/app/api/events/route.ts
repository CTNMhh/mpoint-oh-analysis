import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Alle Events abrufen (optional: nur eigene Events)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Optional: Nur eingeloggte User sehen Events
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  // Optional: Eigene Events anzeigen
  const onlyMine = request.nextUrl.searchParams.get("mine") === "true";
  let where = {};

  if (onlyMine) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    if (!user) {
      return NextResponse.json({ error: "User nicht gefunden." }, { status: 404 });
    }
    where = { userId: user.id };
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: "asc" },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  });

  return NextResponse.json(events);
}

// POST: Neues Event anlegen
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });
  if (!user) {
    return NextResponse.json({ error: "User nicht gefunden." }, { status: 404 });
  }

  const body = await request.json();

  try {
    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate && { endDate: new Date(body.endDate) }),
        startTime: body.startTime,
        endTime: body.endTime,
        location: body.location,
        ventType: body.ventType, // <-- Veranstaltungstyp als Textfeld
        price: body.price ?? 0,
        maxParticipants: body.maxParticipants,
        bookedCount: 0,
        organizer: body.organizer,
        calendarLinks: body.calendarLinks,
        categories: body.categories,
        userId: user.id
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Erstellen des Events." }, { status: 500 });
  }
}