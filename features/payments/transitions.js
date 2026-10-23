export const ORDER_EVENTS = {
  approve: { from: "PENDING", to: "PAID", coupon: null, enrollment: "grant" },
  reject: { from: "PENDING", to: "REJECTED", coupon: "release", enrollment: null },
  cancel: { from: "PENDING", to: "CANCELLED", coupon: "release", enrollment: null },
  refund: { from: "PAID", to: "REFUNDED", coupon: "release", enrollment: "end" },
};

export const canRequestRefund = (order) => order.status === "PAID" && order.amount > 0 && order.refundRequest?.status !== "open";

export const checkoutProblem = ({ base, amount, paid }) => {
  if (paid && base === 0) return "This course is free. Use the enroll button.";
  if (paid && amount === 0) return "This code makes the course free. Use the enroll button.";
  if (!paid && amount !== 0) return "This code does not make the course free";
  return null;
};
