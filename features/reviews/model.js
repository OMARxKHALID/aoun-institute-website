import { Schema, model, models } from "mongoose";

const reviewSchema = new Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    studentName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    body: { type: String, default: "" },
    status: { type: String, enum: ["published", "hidden"], default: "published" },
    reply: { body: String, at: Date },
  },
  { timestamps: true },
);

reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });
reviewSchema.index({ courseId: 1, status: 1, createdAt: -1 });

export default models.Review || model("Review", reviewSchema);
