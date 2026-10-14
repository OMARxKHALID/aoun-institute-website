export const formatPrice = (amount, currency = "PKR") =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount ?? 0);

export const formatDuration = (seconds = 0) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (!h) return `${m} min`;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export const formatDate = (value) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
