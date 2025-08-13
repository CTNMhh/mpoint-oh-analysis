import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const news = await prisma.news.findUnique({
      where: { id: params.id },
    });
    if (!news) {
      return NextResponse.json({ error: "News nicht gefunden." }, { status: 404 });
    }
    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Laden der News." }, { status: 500 });
  }
}
