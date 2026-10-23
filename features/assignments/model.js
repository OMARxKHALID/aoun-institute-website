import { Schema, model, models } from "mongoose";

const assignmentSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true },
    instructions: String,
    dueOn: { type: String, default: null },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    createdBy: String,
  },
  { timestamps: true },
);

assignmentSchema.index({ courseId: 1, createdAt: -1 });

export default models.Assignment || model("Assignment", assignmentSchema);
