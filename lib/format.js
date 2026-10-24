export const formatPrice = (amount, currency = "PKR") =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount ?? 0);

export const discountPercent = (price, discountPrice) => (price > 0 && discountPrice != null && discountPrice < price ? Math.round((1 - discountPrice / price) * 100) : 0);

export const formatDuration = (seconds = 0) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (!h) return `${m} min`;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export const formatDate = (value) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

export const TIME_ZONE = process.env.NEXT_PUBLIC_TIME_ZONE || "Asia/Karachi";

export const dayKey = (date = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);

export const formatClock = (sec = 0) => {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
};

export const plural = (count, word, many = `${word}s`) => `${count} ${count === 1 ? word : many}`;

export const plain = (value) => JSON.parse(JSON.stringify(value));

export const initials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
