import { Schema, model, models } from "mongoose";

const paymentEventSchema = new Schema(
  {
    provider: { type: String, required: true },
    eventId: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    processedAt: { type: Date, default: Date.now },
  },
  { collection: "paymentEvents" },
);

paymentEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

export default models.PaymentEvent || model("PaymentEvent", paymentEventSchema);
