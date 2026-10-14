import { z } from "zod";

export const checkoutSchema = z.strictObject({
  method: z.string().trim().min(1, { error: "Choose how you paid" }).max(60),
  reference: z.string().trim().min(4, { error: "Enter the transaction ID from your receipt" }).max(100),
  receipt: z.object({ url: z.url(), publicId: z.string().min(1), name: z.string().max(200).optional() }).nullish(),
  note: z.string().trim().max(500),
});

export const rejectSchema = z.strictObject({ note: z.string().trim().min(3, { error: "Tell the student why" }).max(500) });
