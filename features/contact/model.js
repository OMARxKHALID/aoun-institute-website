import { Schema, model, models } from "mongoose";

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: String,
    topic: String,
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "read", "archived"], default: "new" },
    ip: String,
  },
  { collection: "contactMessages", timestamps: true },
);

contactMessageSchema.index({ status: 1, createdAt: -1 });

export default models.ContactMessage || model("ContactMessage", contactMessageSchema);
