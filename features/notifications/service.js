import "server-only";
import { Types } from "mongoose";
import { db } from "@/lib/db";
import { linkEmail, sendEmails } from "@/lib/email";
import Enrollment from "@/features/enrollments/model";
import Notification from "@/features/notifications/model";
import { SITE_URL } from "@/lib/site";

export const notifyInApp = (userIds, { title, text, path }) => {
  const ids = [...new Set([userIds].flat().filter(Boolean).map(String))];
  if (!ids.length) return null;
  return Notification.insertMany(ids.map((userId) => ({ userId, title, text, path }))).catch((error) => console.error("[notifications] could not save", error));
};

export const notifyCourseStudents = async (courseId, flag, { subject, title, text, path }) => {
  const enrollments = await Enrollment.find({ courseId, status: "active" }, "userId").lean();
  await notifyInApp(
    enrollments.map((e) => e.userId),
    { title, text, path },
  );
  const ids = enrollments.map((e) => e.userId).filter(Types.ObjectId.isValid).map((id) => new Types.ObjectId(id));
  if (!ids.length) return 0;
  const users = await db
    .collection("user")
    .find({ _id: { $in: ids }, [flag]: { $ne: false }, banned: { $ne: true } }, { projection: { email: 1 } })
    .toArray();
  const url = `${SITE_URL}${path}`;
  const html = linkEmail({ title, text, url, cta: "Open" });
  return sendEmails(users.map((u) => ({ to: u.email, subject, html })));
};
