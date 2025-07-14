import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { createReadStream, existsSync, statSync } from "fs";
import mime from "mime";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const filePath = path.join(process.cwd(), "public", "uploads", ...params.path);

  if (!existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const stat = statSync(filePath);
  const stream = createReadStream(filePath);
  const mimeType = mime.getType(filePath) || "application/octet-stream";

  return new NextResponse(stream as any, {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Content-Length": stat.size.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}