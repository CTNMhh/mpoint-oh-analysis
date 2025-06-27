import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      username,
      email,
      password,
      anrede,
      titel,
      firstName,
      lastName,
    } = data;

    // Pflichtfelder prüfen
    if (
      !username ||
      !email ||
      !password ||
      !anrede ||
      !firstName ||
      !lastName
    ) {
      return NextResponse.json({ error: "Bitte alle Pflichtfelder ausfüllen." }, { status: 400 });
    }

    // E-Mail oder Username schon vergeben?
    const exists = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      },
    });
    if (exists) {
      return NextResponse.json({ error: "E-Mail oder Benutzername bereits vergeben." }, { status: 400 });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // User anlegen
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        anrede,
        titel,
        firstName,
        lastName,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }
    });
  } catch (err) {
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}