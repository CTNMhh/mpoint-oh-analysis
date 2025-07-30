import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { verifyAdmin } from "../utils/verifyAdmin";

const prisma = new PrismaClient();

// Admin-Auth prüfen


// Alle User anzeigen
export async function GET(req: NextRequest) {
  const admin = verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    // Einzelner User
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true, // <--- Rolle wird mitgegeben!
        username: true,
        anrede: true,
        titel: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    }
    return NextResponse.json(user);
  }
  // Alle User
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      username: true,
      anrede: true,
      titel: true,
      role: true, // <--- hinzufügen!
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

// User anlegen
export async function POST(req: NextRequest) {
  const admin = verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.email || !body.password || !body.firstName || !body.lastName || !body.username) {
    return NextResponse.json({ error: "Fehlende Felder" }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) {
    return NextResponse.json({ error: "E-Mail existiert bereits" }, { status: 400 });
  }
  const hashed = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: hashed,
      firstName: body.firstName,
      lastName: body.lastName,
      username: body.username,
      anrede: body.anrede || "",
      titel: body.titel || "",
    },
  });
  return NextResponse.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    anrede: user.anrede,
    titel: user.titel,
  });
}

// User löschen
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
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

// Userdaten aktualisieren
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

  // Felder validieren
  if (!body.email || !body.firstName || !body.lastName || !body.username) {
    return NextResponse.json({ error: "Fehlende Felder" }, { status: 400 });
  }

  // Passwort optional aktualisieren
  let updateData: any = {
    email: body.email,
    firstName: body.firstName,
    lastName: body.lastName,
    username: body.username,
    anrede: body.anrede || "",
    titel: body.titel || "",
    role: body.role, // <--- hinzufügen!
  };
  if (body.password && body.password.trim() !== "") {
    if (body.password.length < 6) {
      return NextResponse.json({ error: "Passwort zu kurz" }, { status: 400 });
    }
    updateData.password = await bcrypt.hash(body.password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      username: true,
      anrede: true,
      titel: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(user);
}