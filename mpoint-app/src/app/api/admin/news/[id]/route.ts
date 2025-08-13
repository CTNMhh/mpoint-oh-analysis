import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const news = await prisma.news.findUnique({ where: { id: params.id } });
  if (!news) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  return NextResponse.json(news);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const news = await prisma.news.update({
    where: { id: params.id },
    data: {
      title: data.title,
      subtitle: data.subtitle,
      shortText: data.shortText,
      longText: data.longText,
      imageUrl: data.imageUrl,
      author: data.author,
      category: data.category,
      tags: data.tags,
      readTime: data.readTime,
    },
  });
  return NextResponse.json(news);
}
