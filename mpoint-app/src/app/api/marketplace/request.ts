// GET: Hole die Anfrage des eingeloggten Nutzers für ein Projekt
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId fehlt" }, { status: 400 });
  }
  try {
    const request = await prisma.marketplaceRequest.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: session.user.id,
        },
      },
    });
    if (!request) {
      return NextResponse.json({ request: null });
    }
    return NextResponse.json({ request });
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Laden der Anfrage." }, { status: 500 });
  }
}

// PATCH: Bearbeite die Anfrage
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { projectId, message } = body;
    if (!projectId) {
      return NextResponse.json({ error: "projectId fehlt" }, { status: 400 });
    }
    const updated = await prisma.marketplaceRequest.update({
      where: {
        projectId_userId: {
          projectId,
          userId: session.user.id,
        },
      },
      data: {
        message: message || "",
      },
    });
    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Bearbeiten der Anfrage." }, { status: 500 });
  }
}

// DELETE: Lösche die Anfrage
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { projectId } = body;
    if (!projectId) {
      return NextResponse.json({ error: "projectId fehlt" }, { status: 400 });
    }
    await prisma.marketplaceRequest.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: session.user.id,
        },
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Löschen der Anfrage." }, { status: 500 });
  }
}
// src/app/api/marketplace/request.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectId, message } = body;
    if (!projectId) {
      return NextResponse.json({ error: "projectId fehlt" }, { status: 400 });
    }

    // Prüfe, ob bereits eine Anfrage existiert
    const existing = await prisma.marketplaceRequest.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: session.user.id,
        },
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Du hast bereits eine Anfrage für dieses Projekt gestellt." }, { status: 400 });
    }

    // Anfrage speichern
    const request = await prisma.marketplaceRequest.create({
      data: {
        userId: session.user.id,
        projectId,
        message: message || "",
        status: "PENDING",
      },
    });
    return NextResponse.json({ success: true, request });
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Absenden der Anfrage." }, { status: 500 });
  }
}
