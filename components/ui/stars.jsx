import { Star } from "lucide-react";

const Stars = ({ value = 0, size = "size-4", className = "" }) => (
  <span role="img" aria-label={`${value} out of 5 stars`} className={`inline-flex items-center gap-0.5 ${className}`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} aria-hidden="true" className={`${size} ${value >= n - 0.25 ? "fill-amber-300 text-amber-300" : value >= n - 0.75 ? "fill-amber-300/50 text-amber-300" : "text-white/30"}`} />
    ))}
  </span>
);

export default Stars;
