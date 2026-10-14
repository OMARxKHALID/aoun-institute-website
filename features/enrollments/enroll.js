import "server-only";
import Enrollment from "@/features/enrollments/model";
import ActivityLog from "@/features/progress/models/activity-log";

export const grantEnrollment = async ({ userId, courseId, source, orderId }) => {
  const result = await Enrollment.updateOne(
    { userId, courseId },
    { $set: { status: "active", source, orderId }, $setOnInsert: { enrolledAt: new Date() } },
    { upsert: true },
  );
  if (result.upsertedCount) await ActivityLog.create({ userId, courseId, type: "enrolled", refId: orderId });
  return result;
};
