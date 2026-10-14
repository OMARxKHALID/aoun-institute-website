import { z } from "zod";

const optional = (max) => z.string().trim().max(max);

export const profileSchema = z.strictObject({
  name: z.string().trim().min(2, { error: "At least 2 characters" }).max(80),
  phone: optional(30).regex(/^[+\d\s()-]*$/, { error: "Digits, spaces and + only" }),
  bio: optional(500),
  country: optional(60),
  city: optional(60),
  birthDate: z.union([z.literal(""), z.iso.date({ error: "Use a valid date" })]),
});

export const passwordSchema = z
  .strictObject({
    currentPassword: z.string().min(1, { error: "Enter your current password" }),
    newPassword: z.string().min(8, { error: "At least 8 characters" }).max(128),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { error: "Passwords do not match", path: ["confirmPassword"] });

export const NOTIFICATIONS = [
  { name: "notifyNewLesson", label: "New lessons", hint: "When a course you are taking gets new lessons." },
  { name: "notifyNewQuiz", label: "New quizzes", hint: "When a new quiz is published in your courses." },
  { name: "notifyAnnouncement", label: "Announcements", hint: "Messages from your instructor." },
  { name: "notifyCertificate", label: "Certificates", hint: "When you earn a certificate." },
];

export const notificationsSchema = z.strictObject(Object.fromEntries(NOTIFICATIONS.map((n) => [n.name, z.boolean()])));
