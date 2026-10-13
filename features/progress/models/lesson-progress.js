import { Schema, model, models } from "mongoose";

const lessonProgressSchema = new Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    watchedSeconds: { type: Number, default: 0 },
    lastPosition: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
    completedAt: Date,
  },
  { collection: "lessonProgress", timestamps: true },
);

lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
lessonProgressSchema.index({ userId: 1, courseId: 1 });

export default models.LessonProgress || model("LessonProgress", lessonProgressSchema);
