import { expect, test } from "bun:test";
import { cardSchema } from "@/features/payments/schemas";

const card = { name: "Test Student", number: "4242 4242 4242 4242", expiry: "12/30", cvc: "123" };

test("accepts the test card and strips spaces", () => {
  const result = cardSchema.safeParse(card);
  expect(result.success).toBe(true);
  expect(result.data.number).toBe("4242424242424242");
});

test("rejects expired cards and bad formats", () => {
  expect(cardSchema.safeParse({ ...card, expiry: "01/20" }).success).toBe(false);
  expect(cardSchema.safeParse({ ...card, expiry: "13/30" }).success).toBe(false);
  expect(cardSchema.safeParse({ ...card, cvc: "12" }).success).toBe(false);
  expect(cardSchema.safeParse({ ...card, number: "4242" }).success).toBe(false);
});
