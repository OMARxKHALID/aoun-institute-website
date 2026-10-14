import { z } from "zod";

export const checkoutSchema = z.strictObject({
  method: z.string().trim().min(1, { error: "Choose how you paid" }).max(60),
  reference: z.string().trim().min(4, { error: "Enter the transaction ID from your receipt" }).max(100),
  receipt: z.object({ url: z.url(), publicId: z.string().min(1), name: z.string().max(200).optional() }).nullish(),
  note: z.string().trim().max(500),
});

export const rejectSchema = z.strictObject({ note: z.string().trim().min(3, { error: "Tell the student why" }).max(500) });

const expiryOk = (value) => {
  const [mm, yy] = value.split("/").map(Number);
  if (!mm || mm > 12) return false;
  const end = new Date(2000 + yy, mm, 1);
  return end > new Date();
};

export const cardSchema = z.strictObject({
  name: z.string().trim().min(2, { error: "Enter the name on the card" }).max(80),
  number: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().regex(/^\d{13,19}$/, { error: "Enter a valid card number" })),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { error: "Use MM/YY" })
    .refine(expiryOk, { error: "This card has expired" }),
  cvc: z.string().trim().regex(/^\d{3,4}$/, { error: "3 or 4 digits" }),
});
