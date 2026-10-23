import "server-only";
import { verifyUpload } from "@/lib/cloudinary";
import Order from "@/features/payments/models/order";

const storeReceipt = async (receipt, userId) => {
  if (!receipt) return { ok: true };
  if (await Order.exists({ "receipt.publicId": receipt.publicId, userId: { $ne: userId } })) return { ok: false, field: "receipt", error: "Invalid upload" };
  const check = await verifyUpload("receipt", receipt.publicId);
  if (!check.ok) return { ok: false, field: "receipt", error: check.error };
  return { ok: true, stored: { publicId: check.asset.publicId, format: check.asset.format } };
};

export const manualPayment = {
  instant: false,
  pay: async ({ method, reference, note, receipt }, { userId }) => {
    const upload = await storeReceipt(receipt, userId);
    if (!upload.ok) return upload;
    return { ok: true, status: "PENDING", fields: { provider: "manual", providerRef: `manual:${reference}`, method, receipt: upload.stored, note: note || undefined } };
  },
};
