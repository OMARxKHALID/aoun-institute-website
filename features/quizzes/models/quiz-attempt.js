import { Schema, model, models } from "mongoose";

const quizAttemptSchema = new Schema(
  {
    userId: { type: String, required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    attemptNo: { type: Number, required: true },
    questionOrder: [Schema.Types.ObjectId],
    optionOrder: { type: Map, of: [Schema.Types.ObjectId] },
    answers: [{ questionId: Schema.Types.ObjectId, selected: [Schema.Types.ObjectId], text: String }],
    startedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    submittedAt: Date,
    score: Number,
    maxScore: Number,
    percent: Number,
    passed: Boolean,
    status: { type: String, enum: ["in_progress", "submitted", "expired"], default: "in_progress" },
  },
  { timestamps: true },
);

quizAttemptSchema.index({ userId: 1, quizId: 1, attemptNo: 1 }, { unique: true });
quizAttemptSchema.index({ quizId: 1 });

export default models.QuizAttempt || model("QuizAttempt", quizAttemptSchema);
