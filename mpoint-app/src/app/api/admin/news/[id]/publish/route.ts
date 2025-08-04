import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { isPublished } = await req.json();
  const news = await prisma.news.update({
    where: { id: params.id },
    data: { isPublished },
  });
  return NextResponse.json(news);
}
