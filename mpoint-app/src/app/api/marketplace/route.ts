// src/app/api/marketplace/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const entries = await prisma.marketplaceEntry.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true, company: { select: { name: true } } } },
        company: { select: { id: true, name: true } } as any,
      },
    } as any);
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Laden." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const body = await req.json();
  // Ermittle Company des aktuellen Users (falls vorhanden)
  const userCompany = await prisma.company.findFirst({ where: { userId: session.user.id }, select: { id: true } });
    const entry = await prisma.marketplaceEntry.create({
      data: ({
        userId: session.user.id,
    companyId: userCompany?.id ?? null,
        category: body.category,
        title: body.title,
        shortDescription: body.shortDescription,
        longDescription: body.longDescription,
        price: body.price,
        type: body.type,
        anonym: !!body.anonym,
        location: body.location,
        deadline: body.deadline ? new Date(body.deadline) : null,
        skills: body.skills,
      }) as any,
    });
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Erstellen." }, { status: 500 });
  }
}
