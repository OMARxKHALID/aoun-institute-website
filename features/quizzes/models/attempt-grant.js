import { Schema, model, models } from "mongoose";

const attemptGrantSchema = new Schema(
  {
    userId: { type: String, required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    extra: { type: Number, default: 0, min: 0 },
  },
  { collection: "attemptGrants", timestamps: true },
);

attemptGrantSchema.index({ userId: 1, quizId: 1 }, { unique: true });

export default models.AttemptGrant || model("AttemptGrant", attemptGrantSchema);
