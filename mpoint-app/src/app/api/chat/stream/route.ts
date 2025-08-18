import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient, MatchStatus } from "@prisma/client";
import { subscribe, unsubscribe } from "../../../../lib/sse";

const prisma = new PrismaClient();

// WICHTIG: nodejs runtime für Coolify
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
// Kein maxDuration needed für self-hosted

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const matchId = req.nextUrl.searchParams.get("matchId") || "";
  const companyIdParam = req.nextUrl.searchParams.get("companyId") || "";
  const userIdParam = req.nextUrl.searchParams.get("userId") || "";

  if (!matchId) {
    return new Response("matchId required", { status: 400 });
  }

  let myCompanyId = companyIdParam;
  if (!myCompanyId && userIdParam) {
    const comp = await prisma.company.findFirst({
      where: { userId: userIdParam },
      select: { id: true }
    });
    myCompanyId = comp?.id || "";
  }

  if (!myCompanyId) {
    return new Response("companyId or userId required", { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { senderCompany: true, receiverCompany: true }
  });

  const isParticipant = match && [match.senderCompanyId, match.receiverCompanyId].includes(myCompanyId);
  
  if (!match || !isParticipant || match.status !== MatchStatus.CONNECTED) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  let pingInterval: NodeJS.Timer | null = null;
  
  const stream = new ReadableStream({
    start(controller) {
      // WICHTIG: Sofort initial data senden für Traefik
      controller.enqueue(encoder.encode("retry: 10000\n\n"));
      controller.enqueue(encoder.encode(": SSE connection established\n\n"));
      
      // Kleine Verzögerung, dann ready event
      setTimeout(() => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "ready" })}\n\n`));
      }, 100);

      const send = (data: any) => {
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error("Error sending SSE message:", error);
          cleanup();
        }
      };

      const cleanup = () => {
        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }
        unsubscribe(matchId, send);
        try {
          controller.close();
        } catch (e) {
          console.error("Error closing controller:", e);
        }
      };

      // Subscribe to events
      subscribe(matchId, send);

      // WICHTIG: Ping alle 10 Sekunden für Traefik/Coolify
      pingInterval = setInterval(() => {
        try {
          // Sende Kommentar-Ping (hält Verbindung offen)
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch (error) {
          console.error("Ping error:", error);
          cleanup();
        }
      }, 10000); // 10 Sekunden - aggressiver für Proxy Timeouts

      // Cleanup on abort
      req.signal.addEventListener("abort", () => {
        cleanup();
      });
    },
    
    cancel() {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    }
  });

  // Headers optimiert für Traefik/Coolify
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, no-transform, must-revalidate, private",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      // WICHTIG für Traefik:
      "X-SSE-Content-Type": "text/event-stream",
      // Disable compression
      "Content-Encoding": "identity",
      // Transfer encoding
      "Transfer-Encoding": "chunked",
      // Keep-Alive mit timeout
      "Keep-Alive": "timeout=300",
    },
  });
}