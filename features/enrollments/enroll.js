import "server-only";
import Enrollment from "@/features/enrollments/model";

export const grantEnrollment = ({ userId, courseId, source, orderId }) =>
  Enrollment.updateOne(
    { userId, courseId },
    { $set: { status: "active", source, orderId }, $setOnInsert: { enrolledAt: new Date() } },
    { upsert: true },
  );
