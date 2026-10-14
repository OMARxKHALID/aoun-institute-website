import "server-only";
import { Types } from "mongoose";
import Course from "@/features/courses/models/course";
import Lesson from "@/features/courses/models/lesson";

export const recomputeCourse = async (courseId) => {
  const [{ total = 0 } = {}] = await Lesson.aggregate([
    { $match: { courseId: new Types.ObjectId(String(courseId)), status: "published" } },
    { $group: { _id: null, total: { $sum: "$durationSec" } } },
  ]);
  await Course.updateOne({ _id: courseId }, { $inc: { contentVersion: 1 }, $set: { estimatedDuration: total } });
};
