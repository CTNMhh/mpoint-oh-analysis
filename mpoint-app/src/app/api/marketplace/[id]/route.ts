import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const entry = await prisma.marketplaceEntry.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });
    if (!entry) {
      return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Laden." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const id = params.id;
  try {
    const body = await req.json();
    const entry = await prisma.marketplaceEntry.update({
      where: { id },
      data: {
        category: body.category,
        title: body.title,
        shortDescription: body.shortDescription,
        longDescription: body.longDescription,
        price: body.price,
        type: body.type,
        email: body.email,
        publicEmail: body.publicEmail ?? false,
        location: body.location,
        deadline: body.deadline ? new Date(body.deadline) : null,
        skills: body.skills,
      },
    });
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Bearbeiten." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const id = params.id;
  try {
    await prisma.marketplaceEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Löschen." }, { status: 500 });
  }
}
