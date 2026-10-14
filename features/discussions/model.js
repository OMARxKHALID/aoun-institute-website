import { Schema, model, models } from "mongoose";

const discussionSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Discussion", default: null },
    userId: { type: String, required: true },
    authorName: { type: String, required: true },
    instructor: { type: Boolean, default: false },
    body: { type: String, required: true },
    answered: { type: Boolean, default: false },
  },
  { timestamps: true },
);

discussionSchema.index({ lessonId: 1, parentId: 1, createdAt: -1 });
discussionSchema.index({ parentId: 1, createdAt: 1 });
discussionSchema.index({ parentId: 1, answered: 1, createdAt: -1 });

export default models.Discussion || model("Discussion", discussionSchema);
