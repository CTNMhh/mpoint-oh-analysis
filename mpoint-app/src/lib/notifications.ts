import { PrismaClient, NotificationType } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Legt eine Notification für einen User an.
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  url?: string | null;
  markUnread?: boolean; // optional, default true
}) {
  const { userId, type, title, body = null, url = null, markUnread = true } = params;

  // Guard + Debug
  if (!type) {
    console.error("createNotification: type fehlt/undefined", { params });
    throw new Error("Notification type fehlt");
  }
  if (!Object.values(NotificationType).includes(type)) {
    console.error("createNotification: Ungültiger NotificationType", { type, allowed: Object.values(NotificationType) });
    throw new Error("Ungültiger NotificationType: " + type);
  }

  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      url,
      isRead: !markUnread ? true : false,
    },
  });
}