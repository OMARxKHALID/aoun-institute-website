import "server-only";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import AuditLog from "@/features/audit/model";

export const getAuditLogs = async () => {
  await requireAdmin();
  await connectDB();
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(2000).lean();
  return JSON.parse(JSON.stringify(logs.map((l) => ({ id: String(l._id), actorName: l.actorName ?? "Admin", action: l.action, summary: l.summary, targetType: l.targetType, targetId: l.targetId, ip: l.ip, createdAt: l.createdAt }))));
};
