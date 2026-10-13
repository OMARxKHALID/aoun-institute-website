import { Schema, model, models } from "mongoose";

const lessonSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    description: String,
    isFreePreview: { type: Boolean, default: false },
    durationSec: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    video: {
      provider: { type: String, enum: ["mux", "embed", "url"] },
      assetId: String,
      playbackId: String,
      uploadId: String,
      status: { type: String, enum: ["none", "uploading", "processing", "ready", "failed"], default: "none" },
      src: String,
      drm: { type: Boolean, default: true },
    },
    attachments: [{ url: String, publicId: String, name: String }],
  },
  { timestamps: true },
);

lessonSchema.index({ courseId: 1 });
lessonSchema.index({ sectionId: 1, order: 1 });

export default models.Lesson || model("Lesson", lessonSchema);
