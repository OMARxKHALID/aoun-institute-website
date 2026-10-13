import { Schema, model, models } from "mongoose";

const sectionSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

sectionSchema.index({ courseId: 1, order: 1 });

export default models.Section || model("Section", sectionSchema);
