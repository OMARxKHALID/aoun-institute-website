import { Schema, model, models } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    kind: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", default: null },
    expiresOn: { type: String, default: null },
    maxUses: { type: Number, default: null },
    uses: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    createdBy: String,
  },
  { timestamps: true },
);

export default models.Coupon || model("Coupon", couponSchema);
