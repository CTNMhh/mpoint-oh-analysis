import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient, MatchStatus } from "@prisma/client";
import { subscribe, unsubscribe } from "../../../../lib/sse";

const prisma = new PrismaClient();
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const matchId = req.nextUrl.searchParams.get("matchId") || "";
  const companyIdParam = req.nextUrl.searchParams.get("companyId") || "";
  const userIdParam = req.nextUrl.searchParams.get("userId") || "";

  if (!matchId) return new Response("matchId required", { status: 400 });

  // companyId NICHT aus Session holen
  let myCompanyId = companyIdParam;
  if (!myCompanyId && userIdParam) {
    const comp = await prisma.company.findFirst({ where: { userId: userIdParam }, select: { id: true } });
    myCompanyId = comp?.id || "";
  }
  if (!myCompanyId) return new Response("companyId or userId required", { status: 400 });

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { senderCompany: true, receiverCompany: true }
  });
  const isParticipant = match && [match.senderCompanyId, match.receiverCompanyId].includes(myCompanyId);
  if (!match || !isParticipant || match.status !== MatchStatus.CONNECTED) return new Response("Forbidden", { status: 403 });

  const encoder = new TextEncoder();
  let ping: NodeJS.Timer | null = null;

  return new Response(new ReadableStream({
    start(controller) {
      // Sofort flushen
      controller.enqueue(encoder.encode(`: open\n\n`));

      const send = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          unsubscribe(matchId, send);
        }
      };

      subscribe(matchId, send);
      send({ type: "ready" });

      // Keepalive alle 25s
      ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(ping!);
          unsubscribe(matchId, send);
          try { controller.close(); } catch {}
        }
      }, 25000);

      // Client bricht ab -> aufräumen
      // @ts-ignore
      req.signal?.addEventListener("abort", () => {
        if (ping) clearInterval(ping);
        unsubscribe(matchId, send);
        try { controller.close(); } catch {}
      });
    },
    cancel() {
      if (ping) clearInterval(ping);
    }
  }), {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Keep-Alive": "timeout=120",
      "X-Accel-Buffering": "no" // schadet nicht; bei Nginx nötig, Traefik ignoriert es
    }
  });
}