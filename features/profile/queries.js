import "server-only";
import { Types } from "mongoose";
import { connectDB, db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { deletionDate } from "@/features/students/service";

export const getProfile = async () => {
  const user = await requireUser();
  await connectDB();
  const doc = await db.collection("user").findOne({ _id: new Types.ObjectId(user.id) });
  return {
    id: user.id,
    email: doc.email,
    name: doc.name ?? "",
    image: doc.image ?? null,
    phone: doc.phone ?? "",
    bio: doc.bio ?? "",
    country: doc.country ?? "",
    city: doc.city ?? "",
    birthDate: doc.birthDate ? new Date(doc.birthDate).toISOString().slice(0, 10) : "",
    notifyNewLesson: doc.notifyNewLesson !== false,
    notifyNewQuiz: doc.notifyNewQuiz !== false,
    notifyAnnouncement: doc.notifyAnnouncement !== false,
    notifyCertificate: doc.notifyCertificate !== false,
    notifyReminders: doc.notifyReminders !== false,
    deletionRequestedAt: doc.deletionRequestedAt ? new Date(doc.deletionRequestedAt).toISOString() : null,
    deletionScheduledFor: doc.deletionRequestedAt ? deletionDate(doc.deletionRequestedAt).toISOString() : null,
    twoFactorEnabled: Boolean(doc.twoFactorEnabled),
    publicProfile: Boolean(doc.publicProfile),
    hasPassword: Boolean(await db.collection("account").findOne({ userId: doc._id, providerId: "credential" }, { projection: { _id: 1 } })),
  };
};
