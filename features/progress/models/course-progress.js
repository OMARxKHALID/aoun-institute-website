import { Schema, model, models } from "mongoose";

const courseProgressSchema = new Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
    passedRequiredQuizzes: { type: Number, default: 0 },
    totalRequiredQuizzes: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
    timeSpentSec: { type: Number, default: 0 },
    lastLessonId: { type: Schema.Types.ObjectId, ref: "Lesson" },
    lastPosition: { type: Number, default: 0 },
    lastActiveAt: Date,
    eligible: { type: Boolean, default: false },
    missing: { lessons: { type: Number, default: 0 }, quizzes: [{ quizId: Schema.Types.ObjectId, title: String }] },
    contentVersion: { type: Number, default: 0 },
  },
  { collection: "courseProgress", timestamps: true },
);

courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default models.CourseProgress || model("CourseProgress", courseProgressSchema);
