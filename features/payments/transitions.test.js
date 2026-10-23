import { expect, test } from "bun:test";
import { ORDER_EVENTS, canRequestRefund, checkoutProblem } from "@/features/payments/transitions";

test("every order event that leaves pending or paid gives the coupon use back except approval", () => {
  expect(ORDER_EVENTS.approve.coupon).toBe(null);
  expect(ORDER_EVENTS.reject.coupon).toBe("release");
  expect(ORDER_EVENTS.cancel.coupon).toBe("release");
  expect(ORDER_EVENTS.refund.coupon).toBe("release");
});

test("approval grants the enrollment and a refund ends it", () => {
  expect(ORDER_EVENTS.approve).toMatchObject({ from: "PENDING", to: "PAID", enrollment: "grant" });
  expect(ORDER_EVENTS.refund).toMatchObject({ from: "PAID", to: "REFUNDED", enrollment: "end" });
  expect(ORDER_EVENTS.reject.enrollment).toBe(null);
  expect(ORDER_EVENTS.cancel.enrollment).toBe(null);
});

test("only paid orders with money and no open request can ask for a refund", () => {
  expect(canRequestRefund({ status: "PAID", amount: 5000 })).toBe(true);
  expect(canRequestRefund({ status: "PAID", amount: 5000, refundRequest: { status: "declined" } })).toBe(true);
  expect(canRequestRefund({ status: "PAID", amount: 5000, refundRequest: { status: "open" } })).toBe(false);
  expect(canRequestRefund({ status: "PAID", amount: 0 })).toBe(false);
  expect(canRequestRefund({ status: "PENDING", amount: 5000 })).toBe(false);
  expect(canRequestRefund({ status: "REFUNDED", amount: 5000 })).toBe(false);
});

test("paid checkout refuses free courses and full-price coupons", () => {
  expect(checkoutProblem({ base: 0, amount: 0, paid: true })).toBe("This course is free. Use the enroll button.");
  expect(checkoutProblem({ base: 5000, amount: 0, paid: true })).toBe("This code makes the course free. Use the enroll button.");
  expect(checkoutProblem({ base: 5000, amount: 4000, paid: true })).toBe(null);
});

test("coupon enrollment needs the code to cover the full price", () => {
  expect(checkoutProblem({ base: 5000, amount: 1000, paid: false })).toBe("This code does not make the course free");
  expect(checkoutProblem({ base: 5000, amount: 0, paid: false })).toBe(null);
});
