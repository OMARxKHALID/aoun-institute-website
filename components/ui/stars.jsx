import { Star } from "lucide-react";

const Stars = ({ value = 0, size = "size-4", className = "" }) => (
  <span role="img" aria-label={`${value} out of 5 stars`} className={`inline-flex items-center gap-0.5 ${className}`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} aria-hidden="true" className={`${size} ${value >= n - 0.25 ? "fill-amber-400 text-amber-400" : value >= n - 0.75 ? "fill-amber-400/50 text-amber-400" : "text-white/25"}`} />
    ))}
  </span>
);

export default Stars;
