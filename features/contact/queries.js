import "server-only";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import ContactMessage from "@/features/contact/model";

export const getContactMessages = async () => {
  await requireAdmin();
  await connectDB();
  const list = await ContactMessage.find({}, "-ip").sort({ createdAt: -1 }).limit(1000).lean();
  return JSON.parse(JSON.stringify(list.map((m) => ({ ...m, id: String(m._id) }))));
};

