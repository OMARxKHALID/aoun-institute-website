export const searchPattern = (q) => {
  const text = String(q ?? "").trim().slice(0, 80);
  return text ? new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : null;
};
