// middleware.ts (im Root-Verzeichnis deiner App)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Wenn die URL mit /uploads/ beginnt, leite zur API weiter
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    const filename = request.nextUrl.pathname.replace('/uploads/', '');
    return NextResponse.rewrite(
      new URL(`/api/files/${filename}`, request.url)
    );
  }
}

export const config = {
  matcher: '/uploads/:path*',
};