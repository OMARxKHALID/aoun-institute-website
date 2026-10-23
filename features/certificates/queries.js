import "server-only";
import { Types } from "mongoose";
import { connectDB, db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/dal";
import Certificate from "@/features/certificates/model";
import Course from "@/features/courses/models/course";
import { CODE_PATTERN } from "@/features/certificates/service";
import { plain } from "@/lib/format";

export const getCertificateByCode = async (code) => {
  const normalized = String(code ?? "").trim().toUpperCase();
  if (!CODE_PATTERN.test(normalized)) return null;
  await connectDB();
  const certificate = await Certificate.findOne({ code: normalized }).lean();
  return certificate && plain({ ...certificate, id: String(certificate._id) });
};

export const getMyCertificates = async () => {
  const user = await requireUser();
  await connectDB();
  const list = await Certificate.find({ userId: user.id }).sort({ issuedAt: -1 }).lean();
  return plain(list.map((c) => ({ ...c, id: String(c._id) })));
};

export const getAdminCertificates = async () => {
  await requireAdmin();
  await connectDB();
  const [list, courses] = await Promise.all([Certificate.find().sort({ issuedAt: -1 }).limit(1000).lean(), Course.find({}, "title").sort({ title: 1 }).lean()]);
  const ids = [...new Set(list.map((c) => c.userId))].filter(Types.ObjectId.isValid).map((id) => new Types.ObjectId(id));
  const users = await db.collection("user").find({ _id: { $in: ids } }, { projection: { email: 1 } }).toArray();
  const emails = new Map(users.map((u) => [String(u._id), u.email]));
  return plain({
    certificates: list.map((c) => ({ id: String(c._id), code: c.code, studentName: c.studentName, email: emails.get(c.userId) ?? "", courseTitle: c.courseTitle, issuedAt: c.issuedAt, status: c.status, reason: c.reason ?? "" })),
    courses: courses.map((c) => ({ value: String(c._id), label: c.title })),
  });
};

export const getPublicLearner = async (id) => {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  const user = await db.collection("user").findOne({ _id: new Types.ObjectId(id), publicProfile: true, banned: { $ne: true } }, { projection: { name: 1, image: 1, city: 1, country: 1 } });
  if (!user) return null;
  const certificates = await Certificate.find({ userId: id, status: "VALID" }, "code courseTitle issuedAt").sort({ issuedAt: -1 }).lean();
  return {
    name: user.name,
    image: user.image ?? null,
    location: [user.city, user.country].filter(Boolean).join(", "),
    certificates: certificates.map((c) => ({ code: c.code, courseTitle: c.courseTitle, issuedAt: c.issuedAt.toISOString() })),
  };
};
