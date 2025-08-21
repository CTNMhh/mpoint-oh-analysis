import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const count = await prisma.marketplaceRequest.count({
      where: { projectId: id },
    });
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Zählen der Anfragen." }, { status: 500 });
  }
}
