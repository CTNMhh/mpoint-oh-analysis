import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", "", { path: "/", expires: new Date(0) }); // Cookie löschen
  return response;
}