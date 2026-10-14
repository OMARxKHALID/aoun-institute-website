import "server-only";
import { clientIp } from "@/lib/rate-limit";
import AuditLog from "@/features/audit/model";

export const audit = async (actor, action, summary, target = {}, meta) => {
  try {
    await AuditLog.create({ actorId: actor.id, actorName: actor.name, action, summary, targetType: target.type, targetId: target.id ? String(target.id) : undefined, meta, ip: await clientIp() });
  } catch (error) {
    console.error("[audit] could not record", action, error);
  }
};
