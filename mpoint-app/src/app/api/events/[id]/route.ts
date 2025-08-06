import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// 🛡️ Inline Logging mit Duplicate-Protection
async function logEventActivity(
  userId: string,
  action: string,
  eventId?: string,
  metadata?: any,
  request?: NextRequest
) {
  try {
    console.log(`[EVENT LOG] ${action} - User: ${userId} - Event: ${eventId || 'none'}`);

    const userAgent = request?.headers.get('user-agent') || undefined;
    const ipAddress = request?.headers.get('x-forwarded-for') ||
                     request?.headers.get('x-real-ip') ||
                     request?.ip ||
                     undefined;

    let deviceType = 'UNKNOWN';
    if (userAgent) {
      if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        deviceType = /iPad/.test(userAgent) ? 'TABLET' : 'MOBILE';
      } else {
        deviceType = 'DESKTOP';
      }
    }

    // 🛡️ Duplicate-Check: Prüfe letzte 10 Sekunden
    const tenSecondsAgo = new Date(Date.now() - 10000);

    const existingLog = await prisma.eventActivityLog.findFirst({
      where: {
        userId,
        action: action as any,
        eventId,
        timestamp: { gte: tenSecondsAgo },
        ipAddress // Extra Schutz
      }
    });

    if (existingLog) {
      console.log(`[EVENT LOG] Duplicate skipped: ${action}`);
      return;
    }

    await prisma.eventActivityLog.create({
      data: {
        userId,
        eventId,
        action: action as any,
        description: `User ${action.toLowerCase().replace('_', ' ')}`,
        ipAddress,
        userAgent,
        deviceType: deviceType as any,
        metadata,
        timestamp: new Date()
      }
    });

    console.log(`[EVENT LOG] Success: ${action}`);

  } catch (error) {
    console.error('Fehler beim Loggen der Event Activity:', error);
  }
}

// GET: Einzelnes Event abrufen
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  // 🆕 NEU HINZUGEFÜGT: Session für Logging (optional - auch ohne Login viewbar)
  const session = await getServerSession(authOptions);
  let userId: string | undefined;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    userId = user?.id;
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });

    if (!event) {
      return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });
    }

    // 🆕 NEU HINZUGEFÜGT: Log Event View (nur wenn User eingeloggt)
    if (userId) {
      await logEventActivity(
        userId,
        'EVENT_VIEWED',
        id,
        {
          eventTitle: event.title,
          eventType: event.ventType,
          price: event.price,
          startDate: event.startDate,
          organizer: event.user.firstName + ' ' + event.user.lastName
        },
        request
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Fehler beim Abrufen des Events:', error);
    return NextResponse.json({ error: "Fehler beim Abrufen des Events." }, { status: 500 });
  }
}

// PUT: Event aktualisieren
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
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
    // 🔄 ANGEPASST: Hole altes Event für Logging-Vergleich
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event nicht gefunden oder keine Berechtigung." }, { status: 404 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: id, userId: user.id },
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        startTime: body.startTime,
        endTime: body.endTime,
        location: body.location,
        ventType: body.ventType,
        price: body.price ?? 0,
        maxParticipants: body.maxParticipants,
        organizer: body.organizer,
        calendarLinks: body.calendarLinks,
        categories: body.categories,
        status: body.status,
        isActive: body.isActive, // <-- richtiges Feld!
        updatedAt: new Date()
      }
    });

    // 🆕 NEU HINZUGEFÜGT: Log Event Update mit Change-Details
    await logEventActivity(
      user.id,
      'EVENT_UPDATED',
      id,
      {
        changedFields: Object.keys(body),
        changes: {
          title: { old: existingEvent.title, new: updatedEvent.title },
          price: { old: existingEvent.price, new: updatedEvent.price },
          location: { old: existingEvent.location, new: updatedEvent.location },
          maxParticipants: { old: existingEvent.maxParticipants, new: updatedEvent.maxParticipants }
        }
      },
      request
    );

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Events:', error);

    // 🆕 NEU HINZUGEFÜGT: Log Failed Update
    await logEventActivity(
      user.id,
      'EVENT_UPDATED',
      id,
      {
        error: error.message,
        attemptedChanges: Object.keys(body || {})
      },
      request
    );

    return NextResponse.json({ error: "Fehler beim Bearbeiten des Events." }, { status: 500 });
  }
}

// 🆕 NEU HINZUGEFÜGT: DELETE: Event löschen
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
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

  try {
    // Prüfe Berechtigung und hole Event-Details für Logging
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: id,
        userId: user.id
      },
      include: {
        bookings: true
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event nicht gefunden oder keine Berechtigung." }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id: id }
    });

    // Log Event Deletion
    await logEventActivity(
      user.id,
      'EVENT_DELETED',
      id,
      {
        deletedEventTitle: existingEvent.title,
        hadBookings: existingEvent.bookings.length > 0,
        bookingsCount: existingEvent.bookings.length,
        eventType: existingEvent.ventType,
        wasScheduledFor: existingEvent.startDate,
        price: existingEvent.price
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
      id,
      {
        error: error.message
      },
      request
    );

    return NextResponse.json({ error: "Fehler beim Löschen des Events." }, { status: 500 });
  }
}