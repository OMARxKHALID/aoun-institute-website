import { Schema, model, models } from "mongoose";

const announcementSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    authorId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
  },
  { timestamps: true },
);

announcementSchema.index({ courseId: 1, createdAt: -1 });

export default models.Announcement || model("Announcement", announcementSchema);
