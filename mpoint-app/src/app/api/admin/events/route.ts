import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Admin-Auth prüfen
function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.isAdmin) return decoded;
    return null;
  } catch {
    return null;
  }
}

// Alle Events anzeigen oder einzelnes Event
export async function GET(req: NextRequest) {
  const admin = verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  try {
    if (id) {
      // Einzelnes Event
      const event = await prisma.event.findUnique({ where: { id } });
      if (!event) {
        return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
      }
      return NextResponse.json(event);
    }
    // Alle Events
    const events = await prisma.event.findMany({ orderBy: { startDate: "desc" } });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Abrufen." }, { status: 500 });
  }
}

// Event anlegen
export async function POST(req: NextRequest) {
  const user = verifyAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.title || !body.startDate) {
    return NextResponse.json({ error: "Fehlende Felder" }, { status: 400 });
  }
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
        price: body.price ?? 0,
        maxParticipants: body.maxParticipants,
        bookedCount: 0,
        organizer: body.organizer,
        calendarLinks: body.calendarLinks,
        // Korrigiere hier: String zu Array
        categories: Array.isArray(body.categories)
          ? body.categories
          : typeof body.categories === "string" && body.categories.length > 0
          ? body.categories.split(",").map((c: string) => c.trim())
          : [],
        userId: user.id,
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Fehler beim Erstellen des Events." }, { status: 500 });
  }
}

// Event löschen
export async function DELETE(req: NextRequest) {
  const admin = verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID fehlt" }, { status: 400 });
  }
  try {
    const event = await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true, event });
  } catch (error) {
    return NextResponse.json({ error: "Event nicht gefunden oder Fehler beim Löschen." }, { status: 404 });
  }
}

// Event aktualisieren
export async function PUT(req: NextRequest) {
  const admin = verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID fehlt" }, { status: 400 });
  }
  const body = await req.json();
  if (!body.title || !body.startDate) {
    return NextResponse.json({ error: "Fehlende Felder" }, { status: 400 });
  }
  try {
    const event = await prisma.event.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description || "",
        imageUrl: body.imageUrl || "",
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        location: body.location || "",
        price: body.price ?? 0,
        organizer: body.organizer || "",
        categories: body.categories || "",
      },
    });
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Event nicht gefunden oder Fehler beim Aktualisieren." }, { status: 404 });
  }
}