"use server";

import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import Notification from "@/features/notifications/model";

export const markNotificationsRead = async () => {
  const user = await requireUser();
  await connectDB();
  await Notification.updateMany({ userId: user.id, readAt: null }, { $set: { readAt: new Date() } });
  return { ok: true };
};
