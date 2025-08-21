import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const entry = await prisma.marketplaceEntry.findUnique({
    where: { id: params.id },
  });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();
  // Nur erlaubte Felder übernehmen
  const {
    category, title, shortDescription, longDescription, price, type,
    email, publicEmail, location, deadline, skills
  } = data;
  const entry = await prisma.marketplaceEntry.update({
    where: { id: params.id },
    data: {
      category, title, shortDescription, longDescription, price, type,
      email, publicEmail, location, deadline, skills
    },
  });
  return NextResponse.json(entry);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.marketplaceEntry.delete({
    where: { id: params.id },
  });
  return NextResponse.json({ success: true });
}
