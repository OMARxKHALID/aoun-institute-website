import { Schema, model, models } from "mongoose";

const asset = { url: String, publicId: String, name: String };

const courseSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: String,
    description: String,
    category: String,
    level: String,
    thumbnail: asset,
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    currency: { type: String, default: "PKR" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    outcomes: [String],
    prerequisites: [String],
    estimatedDuration: { type: Number, default: 0 },
    syllabusFile: asset,
    attachments: [asset],
    sequentialUnlock: { type: Boolean, default: false },
    certificateRule: {
      type: { type: String, enum: ["all", "percent"], default: "all" },
      percent: { type: Number, min: 1, max: 100, default: 100 },
      requireQuizzes: { type: Boolean, default: true },
    },
    contentVersion: { type: Number, default: 1 },
  },
  { timestamps: true },
);

courseSchema.index({ status: 1, createdAt: -1 });

export default models.Course || model("Course", courseSchema);
