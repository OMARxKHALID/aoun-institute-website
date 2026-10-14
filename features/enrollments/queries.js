import "server-only";
import { connectDB } from "@/lib/db";
import Enrollment from "@/features/enrollments/model";
import Order from "@/features/payments/models/order";

export const getCourseAccess = async (userId, courseId) => {
  if (!userId) return { enrolled: false, order: null };
  await connectDB();
  const [enrolled, order] = await Promise.all([
    Enrollment.exists({ userId, courseId, status: "active" }),
    Order.findOne({ userId, courseId }, "status amount currency method providerRef note createdAt").sort({ createdAt: -1 }).lean(),
  ]);
  return { enrolled: Boolean(enrolled), order: order && JSON.parse(JSON.stringify({ ...order, id: String(order._id) })) };
};
