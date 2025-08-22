type Subscriber = (data: any) => void;

// Globaler Channel-Store (Hot-Reload sicher)
const g = globalThis as any;
if (!g.__sseChannels) g.__sseChannels = new Map<string, Set<Subscriber>>();
const channels: Map<string, Set<Subscriber>> = g.__sseChannels;

export function publish(matchId: string, payload: any) {
  const subs = channels.get(matchId);
  if (!subs) return;
  // Kopie iterieren und defekte Subscriber entfernen
  for (const cb of Array.from(subs)) {
    try {
      cb(payload);
    } catch {
      subs.delete(cb);
    }
  }
}

export function subscribe(matchId: string, cb: Subscriber) {
  if (!channels.has(matchId)) channels.set(matchId, new Set());
  channels.get(matchId)!.add(cb);
  return () => unsubscribe(matchId, cb);
}

export function unsubscribe(matchId: string, cb: Subscriber) {
  channels.get(matchId)?.delete(cb);
}