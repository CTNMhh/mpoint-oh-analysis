import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { resolveChatChannel, channelKey } from "@/lib/chatChannel";
import { subscribe, unsubscribe } from "../../../../lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.user?.id;
  if (!me) return new Response("Unauthorized", { status: 401 });

  const peerUserId = req.nextUrl.searchParams.get("peerUserId");
  if (!peerUserId) return new Response("peerUserId required", { status: 400 });
  if (peerUserId === me) return new Response("self not allowed", { status: 400 });

  const channel = await resolveChatChannel(me, peerUserId);
  const key = channelKey(channel);

  const encoder = new TextEncoder();
  let ping: NodeJS.Timer | null = null;

  return new Response(new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          unsubscribe(key, send);
        }
      };
      subscribe(key, send);
      send({ type: "ready" });

      ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(ping!);
          unsubscribe(key, send);
        }
      }, 25000);
    },
    cancel() {
      if (ping) clearInterval(ping);
    }
  }), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive"
    }
  });
}