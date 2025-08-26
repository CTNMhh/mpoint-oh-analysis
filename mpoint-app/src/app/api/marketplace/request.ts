// src/app/api/marketplace/request.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Hole Anfragen
// - Wenn countRequestId gesetzt ist: Anzahl Anfragen für ein Projekt (ohne Auth-Zwang)
// - Wenn list=1 und projectId gesetzt ist: Liste aller Anfragen für ein Projekt (nur für Projektinhaber)
// - Sonst: Anfrage des eingeloggten Nutzers für ein Projekt
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  // NEU: Zähle Anfragen für ein Projekt, wenn countRequestId gesetzt ist
  const countRequestId = searchParams.get("countRequestId");
  if (countRequestId) {
    try {
      const status = searchParams.get("status");
      const where: any = { projectId: countRequestId };
      if (status) where.status = status as any;
      const count = await prisma.marketplaceRequest.count({ where });
      return NextResponse.json({ count });
    } catch (error) {
      return NextResponse.json({ error: "Fehler beim Zählen der Anfragen." }, { status: 500 });
    }
  }
  const projectId = searchParams.get("projectId");
  const list = searchParams.get("list");
  if (!projectId) {
    return NextResponse.json({ error: "projectId fehlt" }, { status: 400 });
  }
  // Liste aller Anfragen für den Projektinhaber
  if (list) {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }
    try {
      const project = await prisma.marketplaceEntry.findUnique({ where: { id: projectId } });
      if (!project) return NextResponse.json({ error: "Projekt nicht gefunden" }, { status: 404 });
      if (project.userId !== session.user.id) {
        return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      }
      const requests = await prisma.marketplaceRequest.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ requests });
    } catch (error) {
      return NextResponse.json({ error: "Fehler beim Laden der Anfragen." }, { status: 500 });
    }
  }
  // Einzelne Anfrage des eingeloggten Nutzers
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
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

// PATCH: Bearbeite eine Anfrage
// - Wenn requestId und status gesetzt: Status ändern (nur für Projektinhaber)
// - Sonst: Eigene Anfrage (durch anfragenden User) bearbeiten (message)
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { projectId, message, requestId, status } = body as {
      projectId?: string;
      message?: string;
      requestId?: string;
      status?: string;
    };

    // Projektinhaber ändert Status einer Anfrage
    if (requestId && typeof status === "string") {
      // Nur erlaubte Status-Werte zulassen
      const allowed = new Set(["PENDING", "ACCEPTED", "DECLINED"]);
      if (!allowed.has(status)) {
        return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 });
      }
      // Request und zugehöriges Projekt laden
      const reqRecord = await prisma.marketplaceRequest.findUnique({
        where: { id: requestId },
        include: { project: { select: { userId: true } } },
      });
      if (!reqRecord) return NextResponse.json({ error: "Anfrage nicht gefunden" }, { status: 404 });
      if (reqRecord.project.userId !== session.user.id) {
        return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      }
      const updated = await prisma.marketplaceRequest.update({
        where: { id: requestId },
        data: { status: status as any },
      });
      return NextResponse.json({ success: true, request: updated });
    }

    // Anfragender Nutzer bearbeitet seine eigene Anfrage (z.B. Nachricht)
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

// POST: Sende eine neue Anfrage
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
