import { Schema, model, models } from "mongoose";

const activityLogSchema = new Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    type: {
      type: String,
      enum: ["lesson_viewed", "lesson_completed", "quiz_started", "quiz_submitted", "certificate_issued", "enrolled"],
      required: true,
    },
    refId: Schema.Types.ObjectId,
    meta: Schema.Types.Mixed,
  },
  { collection: "activityLogs", timestamps: { createdAt: true, updatedAt: false } },
);

activityLogSchema.index({ userId: 1, createdAt: -1 });

export default models.ActivityLog || model("ActivityLog", activityLogSchema);
