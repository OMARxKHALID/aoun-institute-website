import "server-only";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import Notification from "@/features/notifications/model";

export const getMyNotifications = async () => {
  const user = await requireUser();
  await connectDB();
  const [items, unread] = await Promise.all([
    Notification.find({ userId: user.id }).sort({ createdAt: -1 }).limit(20).lean(),
    Notification.countDocuments({ userId: user.id, readAt: null }),
  ]);
  return { unread, items: items.map((n) => ({ id: String(n._id), title: n.title, text: n.text ?? "", path: n.path ?? null, read: Boolean(n.readAt), createdAt: n.createdAt.toISOString() })) };
};
