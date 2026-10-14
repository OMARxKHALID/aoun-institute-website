import "server-only";
import { Types } from "mongoose";
import { db } from "@/lib/db";
import { linkEmail, sendEmails } from "@/lib/email";
import Enrollment from "@/features/enrollments/model";
import { SITE_URL } from "@/lib/site";

export const notifyCourseStudents = async (courseId, flag, { subject, title, text, path }) => {
  const enrollments = await Enrollment.find({ courseId, status: "active" }, "userId").lean();
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
