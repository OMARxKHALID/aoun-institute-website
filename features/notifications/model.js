import { Schema, model, models } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    text: String,
    path: String,
    readAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default models.Notification || model("Notification", notificationSchema);
