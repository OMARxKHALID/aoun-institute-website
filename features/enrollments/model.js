import { Schema, model, models } from "mongoose";

const enrollmentSchema = new Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    status: { type: String, enum: ["active", "revoked"], default: "active" },
    source: { type: String, enum: ["order", "free", "gift"], required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ courseId: 1 });

export default models.Enrollment || model("Enrollment", enrollmentSchema);
