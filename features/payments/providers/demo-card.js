import "server-only";
import { randomBytes } from "node:crypto";

const DEMO_CARDS = { success: "4242424242424242", declined: "4000000000000002", noFunds: "4000000000009995" };

export const demoPaymentsEnabled = () => process.env.DEMO_PAYMENTS === "true";

const luhn = (digits) =>
  [...digits].reverse().reduce((sum, d, i) => {
    const n = Number(d) * (i % 2 ? 2 : 1);
    return sum + (n > 9 ? n - 9 : n);
  }, 0) %
    10 ===
  0;

export const chargeDemoCard = async ({ number }) => {
  if (!luhn(number)) return { ok: false, field: "number", error: "This card number is not valid" };
  if (number === DEMO_CARDS.declined) return { ok: false, field: "number", error: "Your card was declined. Try another card." };
  if (number === DEMO_CARDS.noFunds) return { ok: false, field: "number", error: "Insufficient funds on this card." };
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { ok: true, ref: `demo_${randomBytes(8).toString("hex")}`, last4: number.slice(-4) };
};
