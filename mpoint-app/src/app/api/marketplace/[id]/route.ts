import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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
