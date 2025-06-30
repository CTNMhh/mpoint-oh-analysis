import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Session prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Nicht authentifiziert." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      username,
      email,
      password,
      anrede,
      titel,
      firstName,
      lastName,
    } = body;

    // Validierung der Pflichtfelder
    if (!username || !email || !anrede || !firstName || !lastName) {
      return NextResponse.json(
        {
          error:
            "Username, E-Mail, Anrede, Vorname und Nachname sind Pflichtfelder.",
        },
        { status: 400 }
      );
    }

    // E-Mail-Format validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Ungültiges E-Mail-Format." },
        { status: 400 }
      );
    }

    // Prüfen, ob Username bereits existiert (außer für den aktuellen Benutzer)
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (
      existingUserByUsername &&
      existingUserByUsername.email !== session.user.email
    ) {
      return NextResponse.json(
        { error: "Dieser Benutzername ist bereits vergeben." },
        { status: 400 }
      );
    }

    // Prüfen, ob E-Mail bereits existiert (außer für den aktuellen Benutzer)
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (
      existingUserByEmail &&
      existingUserByEmail.email !== session.user.email
    ) {
      return NextResponse.json(
        { error: "Diese E-Mail-Adresse ist bereits vergeben." },
        { status: 400 }
      );
    }

    // Daten für Update vorbereiten
    const updateData: any = {
      username,
      email,
      anrede,
      titel: titel || null, // Titel ist optional
      firstName,
      lastName,
    };

    // Passwort hashen, falls angegeben
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Passwort muss mindestens 6 Zeichen lang sein." },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Benutzer aktualisieren
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        anrede: true,
        titel: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
        // Passwort NICHT zurückgeben
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Profil erfolgreich aktualisiert.",
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Profils:", error);

    // Spezifische Prisma-Fehler behandeln
    if (typeof error === "object" && error !== null && "code" in error && (error as any).code === "P2002") {
      const target = (error as any).meta?.target;
      if (target?.includes("username")) {
        return NextResponse.json(
          { error: "Dieser Benutzername ist bereits vergeben." },
          { status: 400 }
        );
      }
      if (target?.includes("email")) {
        return NextResponse.json(
          { error: "Diese E-Mail-Adresse ist bereits vergeben." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Serverfehler. Bitte versuchen Sie es später erneut." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}