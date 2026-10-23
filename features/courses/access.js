import "server-only";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { isAdmin, isTeacher } from "@/lib/dal";
import Course from "@/features/courses/models/course";

export const canTeach = async (user, courseId) => {
  if (isAdmin(user)) return true;
  if (!isTeacher(user) || !isValidObjectId(String(courseId))) return false;
  await connectDB();
  return Boolean(await Course.exists({ _id: courseId, teacherIds: user.id }));
};

export const taughtCourseIds = async (user) => {
  if (isAdmin(user)) return null;
  if (!isTeacher(user)) return [];
  await connectDB();
  return (await Course.find({ teacherIds: user.id }, "_id").lean()).map((c) => c._id);
};

export const courseScope = async (user, field = "courseId") => {
  const ids = await taughtCourseIds(user);
  return ids ? { [field]: { $in: ids } } : {};
};
