import { Schema, model, models } from "mongoose";

const orderSchema = new Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "PKR" },
    provider: { type: String, required: true, default: "manual" },
    method: String,
    status: { type: String, enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], default: "PENDING" },
    providerRef: String,
    receipt: { publicId: String, format: String },
    note: String,
    reviewedBy: String,
    paidAt: Date,
    refundedAt: Date,
  },
  { timestamps: true },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ providerRef: 1 }, { unique: true, sparse: true });

export default models.Order || model("Order", orderSchema);
