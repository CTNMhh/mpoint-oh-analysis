import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  // Alle News abrufen (für die Admin-Liste)
  const news = await prisma.news.findMany({ orderBy: { publishDate: "desc" } });
  return NextResponse.json(news);
}

export async function POST(req: NextRequest) {
  // Neue News anlegen
  const data = await req.json();
  const news = await prisma.news.create({
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
      isPublished: false,
    },
  });
  return NextResponse.json(news);
}
