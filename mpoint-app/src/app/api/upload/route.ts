import { NextRequest, NextResponse } from "next/server";
import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Nur Bilder und SVG erlauben
    if (
      !file.type.startsWith("image/") &&
      file.type !== "image/svg+xml"
    ) {
      return NextResponse.json({ error: "Nur Bilddateien und SVG erlaubt." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}_${file.name}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ordner anlegen, falls nicht vorhanden
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // Datei speichern
    await writeFile(path.join(uploadDir, filename), buffer);

    // URL für das Bild zurückgeben
const url = `/api/files/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: "Upload fehlgeschlagen", details: String(error) }, { status: 500 });
  }
}