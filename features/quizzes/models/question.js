import { Schema, model, models } from "mongoose";

const questionSchema = new Schema(
  {
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    type: { type: String, enum: ["single", "multiple", "true_false", "short_answer"], required: true },
    prompt: { type: String, required: true },
    options: [{ text: { type: String, required: true }, isCorrect: { type: Boolean, default: false } }],
    acceptedAnswers: [String],
    points: { type: Number, min: 0, default: 1 },
    explanation: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

questionSchema.index({ quizId: 1, order: 1 });

export default models.Question || model("Question", questionSchema);
