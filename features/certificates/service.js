import "server-only";
import { randomInt } from "node:crypto";
import Certificate from "@/features/certificates/model";
import ActivityLog from "@/features/progress/models/activity-log";
import { linkEmail, sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateCode = () => `INST-${new Date().getFullYear()}-${Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")}`;

export const CODE_PATTERN = /^INST-\d{4}-[A-Z2-9]{8}$/;

export const createCertificate = async ({ user, course, reissuedFrom }) => {
  for (let tries = 0; tries < 5; tries += 1) {
    try {
      return await Certificate.create({ code: generateCode(), userId: user.id, courseId: course._id, studentName: user.name, courseTitle: course.title, reissuedFrom });
    } catch (error) {
      if (error?.code !== 11000) throw error;
      if (error.keyPattern?.userId) return Certificate.findOne({ userId: user.id, courseId: course._id, status: "VALID" });
    }
  }
  throw new Error("Could not generate a unique certificate code");
};

export const notifyCertificate = (user, certificate) => {
  if (user.notifyCertificate === false || !user.email) return null;
  return sendEmail({
    to: user.email,
    subject: `Your certificate for ${certificate.courseTitle}`,
    html: linkEmail({ title: "Congratulations!", text: `You completed ${certificate.courseTitle}. Your certificate code is ${certificate.code}.`, url: `${SITE_URL}/verify/${certificate.code}`, cta: "View certificate" }),
  }).catch((error) => console.error("[certificates] email failed", error));
};

export const issueCertificateIfEligible = async (user, courseId, result) => {
  if (!result?.stats.eligible) return null;
  const existing = await Certificate.findOne({ userId: user.id, courseId, status: "VALID" }).lean();
  if (existing) return existing;
  const certificate = await createCertificate({ user, course: result.course });
  await ActivityLog.create({ userId: user.id, courseId, type: "certificate_issued", refId: certificate._id });
  await notifyCertificate(user, certificate);
  return certificate;
};
