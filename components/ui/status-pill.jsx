const tones = {
  green: "bg-green-500/10 text-green-400 border-green-500/30",
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  red: "bg-red-500/10 text-red-400 border-red-500/30",
  accent: "bg-accent/10 text-accent border-accent/30",
  gray: "bg-white/5 text-white/70 border-white/15",
};

const statusTone = {
  published: "green",
  draft: "gray",
  PAID: "green",
  PENDING: "amber",
  FAILED: "red",
  REJECTED: "red",
  CANCELLED: "gray",
  REFUNDED: "gray",
  VALID: "green",
  REVOKED: "red",
  ready: "green",
  processing: "amber",
  uploading: "amber",
  failed: "red",
  none: "gray",
  active: "green",
  banned: "red",
  deletion: "amber",
  unverified: "gray",
  revoked: "red",
  in_progress: "accent",
  new: "accent",
  read: "gray",
  archived: "gray",
};

const statusLabel = { draft: "unpublished" };

const StatusPill = ({ status, label, tone }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${tones[tone ?? statusTone[status] ?? "gray"]}`}>
    {label ?? statusLabel[status] ?? String(status).toLowerCase()}
  </span>
);

export default StatusPill;
