import { Schema, model, models } from "mongoose";

const noteSchema = new Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    sec: { type: Number, min: 0, default: 0 },
    body: { type: String, required: true },
  },
  { timestamps: true },
);

noteSchema.index({ userId: 1, lessonId: 1, sec: 1 });
noteSchema.index({ userId: 1, createdAt: -1 });

export default models.Note || model("Note", noteSchema);
