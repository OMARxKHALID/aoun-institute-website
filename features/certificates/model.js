import { Schema, model, models } from "mongoose";

const certificateSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    studentName: { type: String, required: true },
    courseTitle: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["VALID", "REVOKED"], default: "VALID" },
    revokedAt: Date,
    reason: String,
    reissuedFrom: { type: Schema.Types.ObjectId, ref: "Certificate" },
  },
  { timestamps: true },
);

certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true, partialFilterExpression: { status: "VALID" } });

export default models.Certificate || model("Certificate", certificateSchema);
