"use server";

import { Types, isValidObjectId } from "mongoose";
import { z } from "zod";
import { connectDB, db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import Certificate from "@/features/certificates/model";
import Course from "@/features/courses/models/course";
import { createCertificate, notifyCertificate } from "@/features/certificates/service";

const reasonSchema = z.strictObject({ reason: z.string().trim().min(3, { error: "Give a reason" }).max(300) });

const issueSchema = z.strictObject({
  email: z.email({ error: "Enter the student's email" }).trim().toLowerCase(),
  courseId: z.string().regex(/^[a-f\d]{24}$/i, { error: "Choose a course" }),
});

const loadUser = async (userId) => {
  if (!Types.ObjectId.isValid(userId)) return null;
  const doc = await db.collection("user").findOne({ _id: new Types.ObjectId(userId) });
  return doc && { id: String(doc._id), name: doc.name, email: doc.email, notifyCertificate: doc.notifyCertificate };
};

export const revokeCertificate = async (certificateId, input) => {
  await requireAdmin();
  const result = parse(reasonSchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(certificateId)) return fail("Certificate not found");
  await connectDB();
  const updated = await Certificate.updateOne({ _id: certificateId, status: "VALID" }, { $set: { status: "REVOKED", revokedAt: new Date(), reason: result.data.reason } });
  if (!updated.modifiedCount) return fail("Certificate is already revoked");
  return { ok: true };
};

export const reissueCertificate = async (certificateId) => {
  await requireAdmin();
  if (!isValidObjectId(certificateId)) return fail("Certificate not found");
  await connectDB();
  const old = await Certificate.findById(certificateId).lean();
  if (!old) return fail("Certificate not found");
  const [user, course] = await Promise.all([loadUser(old.userId), Course.findById(old.courseId, "title").lean()]);
  if (!user || !course) return fail("The student or course no longer exists");
  await Certificate.updateOne({ _id: old._id, status: "VALID" }, { $set: { status: "REVOKED", revokedAt: new Date(), reason: "Reissued" } });
  const certificate = await createCertificate({ user, course, reissuedFrom: old._id });
  await notifyCertificate(user, certificate);
  return { ok: true, data: { code: certificate.code } };
};

export const issueCertificateManually = async (input) => {
  await requireAdmin();
  const result = parse(issueSchema, input);
  if (!result.ok) return result;
  await connectDB();
  const doc = await db.collection("user").findOne({ email: result.data.email });
  if (!doc) return fail("No student with this email", "email");
  const course = await Course.findById(result.data.courseId, "title").lean();
  if (!course) return fail("Course not found", "courseId");
  const user = { id: String(doc._id), name: doc.name, email: doc.email, notifyCertificate: doc.notifyCertificate };
  if (await Certificate.exists({ userId: user.id, courseId: course._id, status: "VALID" })) return fail("This student already has a valid certificate for this course", "email");
  const certificate = await createCertificate({ user, course });
  await notifyCertificate(user, certificate);
  return { ok: true, data: { code: certificate.code } };
};
