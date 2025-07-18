import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // Setze das in .env!

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json({ error: "Admin nicht gefunden." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
    }

    // JWT erstellen
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        isAdmin: true,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Cookie setzen (HttpOnly)
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
      }
    });
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" || req.nextUrl.protocol === "https:",
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}