import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
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
    return NextResponse.json({ error: "Fehler beim Abrufen des Events." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const event = await prisma.event.update({
      where: { id: params.id, userId: user.id },
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
        updatedAt: new Date()
      }
    });
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Bearbeiten des Events." }, { status: 500 });
  }
}