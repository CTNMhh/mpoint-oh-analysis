import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Baue den Dateipfad
    const filepath = path.join(process.cwd(), "public/uploads", params.filename);
    
    // Prüfe ob Datei existiert
    if (!existsSync(filepath)) {
      return new NextResponse("File not found", { status: 404 });
    }
    
    // Lese die Datei
    const file = await readFile(filepath);
    
    // Bestimme den Dateityp
    const ext = path.extname(params.filename).toLowerCase();
    const contentType = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg", 
      ".png": "image/png",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".webp": "image/webp"
    }[ext] || "application/octet-stream";
    
    // Sende die Datei zurück
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600"
      },
    });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}