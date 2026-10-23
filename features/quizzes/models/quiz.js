import { Schema, model, models } from "mongoose";

const quizSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section" },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson" },
    title: { type: String, required: true, trim: true },
    description: String,
    order: { type: Number, default: 0 },
    passingPercent: { type: Number, min: 0, max: 100, default: 70 },
    maxAttempts: { type: Number, min: 1, default: null },
    drawCount: { type: Number, min: 1, default: null },
    timeLimitSec: { type: Number, min: 0, default: null },
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    showAnswers: { type: String, enum: ["never", "after_pass", "always"], default: "after_pass" },
    displayMode: { type: String, enum: ["one", "all"], default: "all" },
    requiredForCertificate: { type: Boolean, default: true },
    dueAt: Date,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true },
);

quizSchema.index({ courseId: 1 });
quizSchema.index({ sectionId: 1, order: 1 });

export default models.Quiz || model("Quiz", quizSchema);
