import { Schema, model, models } from "mongoose";

const auditLogSchema = new Schema(
  {
    actorId: { type: String, required: true },
    actorName: String,
    action: { type: String, required: true },
    targetType: String,
    targetId: String,
    summary: { type: String, required: true },
    meta: Schema.Types.Mixed,
    ip: String,
  },
  { collection: "auditLogs", timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

export default models.AuditLog || model("AuditLog", auditLogSchema);
