// mpoint\mpoint-app\src\app\api\events\[id]\route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { createNotification } from "../../../../lib/notifications";
import { NotificationType } from "@prisma/client";// <-- Pfad anpassen falls anders
const prisma = new PrismaClient();

// 🛡️ Inline Logging mit Duplicate-Protection


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




    // Notification bei erfolgreichem Update
    try {
      console.log("NotificationType available values:", NotificationType);
      // Falls dein Enum keinen EVENT_UPDATED Wert hat, passe auf einen existierenden (z.B. EVENT_CREATED oder EVENT_CHANGE) an
      const notificationType = (NotificationType as any).EVENT_UPDATED ?? NotificationType.EVENT_CREATED;
      await createNotification({
        userId: user.id,
        type: notificationType,
        title: "Event aktualisiert",
        body: `Dein Event "${updatedEvent.title}" wurde erfolgreich aktualisiert.`,
        url: `/events/${updatedEvent.id}`
      });
    } catch (e) {
      console.error("Notification (EVENT_UPDATED) fehlgeschlagen:", e);
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Events:', error);


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


    try {
      console.log("NotificationType available values:", NotificationType);

      await createNotification({
        userId: user.id,
        type: NotificationType.SYSTEM,
        title: "Event gelöscht",
        body: `Dein Event "${existingEvent.title}" wurde gelöscht.`,
        url: `/events`
      });
    } catch (e) {
      console.error("Notification (EVENT_UPDATED) fehlgeschlagen:", e);
    }


    return NextResponse.json({ message: "Event erfolgreich gelöscht." });
  } catch (error) {
    console.error('Fehler beim Löschen des Events:', error);



    return NextResponse.json({ error: "Fehler beim Löschen des Events." }, { status: 500 });
  }
}