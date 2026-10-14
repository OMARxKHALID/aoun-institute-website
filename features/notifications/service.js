import "server-only";
import { Types } from "mongoose";
import { db } from "@/lib/db";
import { linkEmail, sendEmail } from "@/lib/email";
import Enrollment from "@/features/enrollments/model";

export const notifyCourseStudents = async (courseId, flag, { subject, title, text, path }) => {
  const enrollments = await Enrollment.find({ courseId, status: "active" }, "userId").lean();
  const ids = enrollments.map((e) => e.userId).filter(Types.ObjectId.isValid).map((id) => new Types.ObjectId(id));
  if (!ids.length) return 0;
  const users = await db
    .collection("user")
    .find({ _id: { $in: ids }, [flag]: { $ne: false }, banned: { $ne: true } }, { projection: { email: 1 } })
    .toArray();
  const url = `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}${path}`;
  const results = await Promise.allSettled(users.map((u) => sendEmail({ to: u.email, subject, html: linkEmail({ title, text, url, cta: "Open" }) })));
  results.filter((r) => r.status === "rejected").forEach((r) => console.error("[notify] email failed", r.reason));
  return users.length;
};
