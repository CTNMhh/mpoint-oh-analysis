// mpoint\mpoint-app\src\app\api\events\route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// 🆕 NEU HINZUGEFÜGT: Helper function für Activity Logging

// 🆕 NEU HINZUGEFÜGT: Helper function für Activity Logging
async function logEventActivity(
  userId: string,
  action: string,
  eventId?: string,
  metadata?: any,
  request?: NextRequest
) {
  try {
    // Extrahiere technische Details aus Request
    const userAgent = request?.headers.get('user-agent') || undefined;
    const ipAddress = request?.headers.get('x-forwarded-for') ||
                     request?.headers.get('x-real-ip') ||
                     request?.ip ||
                     undefined;

    // Bestimme Device Type basierend auf User Agent
    let deviceType = 'UNKNOWN';
    if (userAgent) {
      if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        deviceType = /iPad/.test(userAgent) ? 'TABLET' : 'MOBILE';
      } else {
        deviceType = 'DESKTOP';
      }
    }

    await prisma.eventActivityLog.create({
      data: {
        userId,
        eventId,
        action: action as any, // EventActionType
        description: `User ${action.toLowerCase().replace('_', ' ')}`,
        ipAddress,
        userAgent,
        deviceType: deviceType as any,
        metadata,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Fehler beim Loggen der Event Activity:', error);
    // Logging-Fehler sollen die Hauptfunktion nicht unterbrechen
  }
}

// GET: Alle Events abrufen (optional: nur eigene Events)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Optional: Nur eingeloggte User sehen Events
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  // 🔄 ANGEPASST: User-Lookup für Logging hinzugefügt
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) {
    return NextResponse.json({ error: "User nicht gefunden." }, { status: 404 });
  }

  // Optional: Eigene Events anzeigen
  const onlyMine = request.nextUrl.searchParams.get("mine") === "true";
  let where = {};

  if (onlyMine) {
    // 🔄 ANGEPASST: User-ID direkt verwenden (war vorher doppelte Abfrage)
    where = { userId: user.id };
  }

  try {
    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: "asc" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });

    // 🆕 NEU HINZUGEFÜGT: Log Event List View
    await logEventActivity(
      user.id,
      'EVENT_LIST_VIEWED',
      undefined,
      {
        onlyMine,
        eventsCount: events.length,
        filters: Object.fromEntries(request.nextUrl.searchParams)
      },
      request
    );

    return NextResponse.json(events);
  } catch (error) {
    console.error('Fehler beim Abrufen der Events:', error);
    return NextResponse.json({ error: "Fehler beim Abrufen der Events." }, { status: 500 });
  }
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

  // Debug
  console.log("Received from frontend:", {
    status: body.status,
    isActive: body.isActive,
    chargeFree: body.chargeFree
  });

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
        ventType: body.ventType,
        price: body.chargeFree ? 0 : (body.price ?? 0),
        chargeFree: body.chargeFree ?? false,  // ✅ HINZUGEFÜGT
        maxParticipants: body.maxParticipants,
        bookedCount: 0,
        organizer: body.organizer,
        calendarLinks: body.calendarLinks,
        categories: body.categories,
        userId: user.id,

        // ✅ DIESE ZEILEN WAREN DAS PROBLEM - JETZT HINZUGEFÜGT:
        status: body.status || "DRAFT",
        isActive: body.isActive ?? false,
        isPublished: body.status === "PUBLISHED"
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    // Activity Logging
    await logEventActivity(
      user.id,
      'EVENT_CREATED',
      event.id,
      {
        eventTitle: event.title,
        eventType: event.ventType,
        price: event.price,
        chargeFree: event.chargeFree,
        status: event.status,
        isActive: event.isActive,
        maxParticipants: event.maxParticipants,
        location: event.location,
        startDate: event.startDate,
        categories: event.categories
      },
      request
    );

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error('Fehler beim Erstellen des Events:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    // Logging auch bei Fehler
    await logEventActivity(
      user.id,
      'EVENT_CREATED',
      undefined,
      {
        error: error.message,
        errorCode: error.code,
        eventData: body
      },
      request
    );

    return NextResponse.json({
      error: "Fehler beim Erstellen des Events.",
      details: error.message
    }, { status: 500 });
  }
}

// 🆕 NEU HINZUGEFÜGT: PUT: Event aktualisieren
export async function PUT(request: NextRequest) {
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
  const eventId = body.id;

  if (!eventId) {
    return NextResponse.json({ error: "Event ID fehlt." }, { status: 400 });
  }

  try {
    // Prüfe ob User Berechtigung hat
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: user.id
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event nicht gefunden oder keine Berechtigung." }, { status: 404 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate && { endDate: new Date(body.endDate) }),
        startTime: body.startTime,
        endTime: body.endTime,
        location: body.location,
        ventType: body.ventType,
        price: body.price ?? 0,
        maxParticipants: body.maxParticipants !== undefined ? body.maxParticipants : null,
        organizer: body.organizer,
        calendarLinks: body.calendarLinks,
        categories: body.categories,
        updatedAt: new Date()
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    // Log Event Update
    await logEventActivity(
      user.id,
      'EVENT_UPDATED',
      eventId,
      {
        changedFields: Object.keys(body).filter(key => key !== 'id'),
        oldTitle: existingEvent.title,
        newTitle: updatedEvent.title,
        oldPrice: existingEvent.price,
        newPrice: updatedEvent.price
      },
      request
    );

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Events:', error);

    // Log Failed Update
    await logEventActivity(
      user.id,
      'EVENT_UPDATED',
      eventId,
      {
        error: error.message,
        attemptedChanges: Object.keys(body)
      },
      request
    );

    return NextResponse.json({ error: "Fehler beim Aktualisieren des Events." }, { status: 500 });
  }
}

// 🆕 NEU HINZUGEFÜGT: DELETE: Event löschen
export async function DELETE(request: NextRequest) {
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

  const eventId = request.nextUrl.searchParams.get("id");

  if (!eventId) {
    return NextResponse.json({ error: "Event ID fehlt." }, { status: 400 });
  }

  try {
    // Prüfe ob User Berechtigung hat und hole Event-Details für Logging
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: user.id
      },
      include: {
        bookings: true // Für Logging-Zwecke
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event nicht gefunden oder keine Berechtigung." }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id: eventId }
    });

    // Log Event Deletion
    await logEventActivity(
      user.id,
      'EVENT_DELETED',
      eventId,
      {
        deletedEventTitle: existingEvent.title,
        hadBookings: existingEvent.bookings.length > 0,
        bookingsCount: existingEvent.bookings.length,
        eventType: existingEvent.ventType,
        wasScheduledFor: existingEvent.startDate
      },
      request
    );

    return NextResponse.json({ message: "Event erfolgreich gelöscht." });
  } catch (error) {
    console.error('Fehler beim Löschen des Events:', error);

    // Log Failed Deletion
    await logEventActivity(
      user.id,
      'EVENT_DELETED',
      eventId,
      {
        error: error.message
      },
      request
    );

    return NextResponse.json({ error: "Fehler beim Löschen des Events." }, { status: 500 });
  }
}