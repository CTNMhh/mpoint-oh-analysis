import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Fetching news...');
    const news = await prisma.news.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        publishDate: 'desc',
      },
    });
    console.log('Fetched news:', news);

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Error fetching news:' + error },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, shortText, longText, imageUrl, author, category, ...rest } = body;

    const news = await prisma.news.create({
      data: {
        title,
        shortText: shortText,
        longText: longText,
        imageUrl,
        author,
        category,
        isPublished: true,
        publishDate: new Date(),
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { error: 'Error creating news' },
      { status: 500 }
    );
  }
}
